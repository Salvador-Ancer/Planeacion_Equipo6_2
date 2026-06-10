package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class RagService {

    @Value("${ords.base.url}")
    private String ordsBaseUrl;

    @Value("${ords.password}")
    private String ordsPassword;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String ORDS_USER = "ADMIN";
    private static final String GROQ_URL  = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";
    private static final String EMBEDDING_MODEL = "ALL_MINILM_L12_V2";
    private static final int EMBEDDING_DIM = 384;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    // ── Escapar texto para usarlo dentro de un literal SQL ────────
    private String escapeSql(String input) {
        return input.replace("'", "''");
    }

    // ── Ejecutar SQL via ORDS ─────────────────────────────────────
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> runSql(String query) throws Exception {
        String credentials = Base64.getEncoder()
                .encodeToString((ORDS_USER + ":" + ordsPassword).getBytes());

        ObjectNode body = mapper.createObjectNode();
        body.put("statementText", query);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ordsBaseUrl + "/_/sql"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + credentials)
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode root = mapper.readTree(response.body());
        JsonNode items = root.path("items");
        if (!items.isArray() || items.isEmpty()) return List.of();

        JsonNode resultSet = items.get(0).path("resultSet").path("items");
        if (!resultSet.isArray()) return List.of();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (JsonNode row : resultSet) {
            rows.add(mapper.convertValue(row, Map.class));
        }
        return rows;
    }

    // ── Generar el embedding de la pregunta y devolverlo como literal TO_VECTOR(...) ──
    private String embedQuestionAsVectorExpr(String pregunta) throws Exception {
        String escaped = escapeSql(pregunta);
        List<Map<String, Object>> rows = runSql(
            "SELECT VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING '" + escaped + "' AS data) AS EMB FROM dual"
        );
        if (rows.isEmpty() || rows.get(0).get("emb") == null) {
            throw new IllegalStateException("No se pudo generar el embedding de la pregunta");
        }
        String embeddingJson = mapper.writeValueAsString(rows.get(0).get("emb"));
        return "TO_VECTOR('" + embeddingJson + "', " + EMBEDDING_DIM + ", FLOAT32)";
    }

    // ── Construir contexto filtrado por proyecto y ordenado por similitud semántica ──
    private String getContext(Long proyectoId, String pregunta) throws Exception {
        String vectorExpr = embedQuestionAsVectorExpr(pregunta);
        StringBuilder ctx = new StringBuilder();

        // Siempre: info del proyecto
        List<Map<String, Object>> proyectos = runSql(
            "SELECT NOMBRE, ESTATUS, DESCRIPCION, " +
            "TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD') as FECHA_INICIO, " +
            "TO_CHAR(FECHA_FIN, 'YYYY-MM-DD') as FECHA_FIN " +
            "FROM ADMIN.PROYECTOS WHERE PROYECTO_ID = " + proyectoId
        );
        if (!proyectos.isEmpty()) {
            Map<String, Object> p = proyectos.get(0);
            ctx.append("PROYECTO: ").append(p.get("nombre"))
               .append(" | Estatus: ").append(p.get("estatus"))
               .append(" | ").append(p.get("descripcion")).append("\n");
            ctx.append("Fechas: ").append(p.get("fecha_inicio"))
               .append(" → ").append(p.get("fecha_fin")).append("\n");
        }

        // Sprints más relevantes para la pregunta
        List<Map<String, Object>> sprints = runSql(
            "SELECT NOMBRE, ESTATUS, OBJETIVO, " +
            "TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD') as FECHA_INICIO, " +
            "TO_CHAR(FECHA_FIN, 'YYYY-MM-DD') as FECHA_FIN " +
            "FROM ADMIN.SPRINTS WHERE PROYECTO_ID = " + proyectoId + " " +
            "ORDER BY VECTOR_DISTANCE(EMBEDDING, " + vectorExpr + ", COSINE) " +
            "FETCH FIRST 5 ROWS ONLY"
        );
        if (!sprints.isEmpty()) {
            ctx.append("\nSPRINTS:\n");
            for (Map<String, Object> s : sprints) {
                ctx.append("- ").append(s.get("nombre"))
                   .append(" | ").append(s.get("estatus"))
                   .append(" | Objetivo: ").append(s.get("objetivo"))
                   .append(" | ").append(s.get("fecha_inicio"))
                   .append(" → ").append(s.get("fecha_fin")).append("\n");
            }
        }

        // Tareas más relevantes para la pregunta
        List<Map<String, Object>> tareas = runSql(
            "SELECT t.NOMBRE, t.ESTATUS, t.PRIORIDAD, t.DESCRIPCION, " +
            "t.HORAS_ESTIMADAS, t.HORAS_REALES, t.STORY_POINTS, " +
            "u.FULL_NAME as ASIGNADO, s.NOMBRE as SPRINT " +
            "FROM ADMIN.TAREAS t " +
            "LEFT JOIN ADMIN.USUARIOS u ON u.USER_ID = t.ASIGNADO_A " +
            "LEFT JOIN ADMIN.SPRINTS s ON s.SPRINT_ID = t.SPRINT_ID " +
            "WHERE t.PROYECTO_ID = " + proyectoId + " AND t.BORRADO = 0 " +
            "ORDER BY VECTOR_DISTANCE(t.EMBEDDING, " + vectorExpr + ", COSINE) " +
            "FETCH FIRST 8 ROWS ONLY"
        );
        if (!tareas.isEmpty()) {
            ctx.append("\nTAREAS:\n");
            for (Map<String, Object> t : tareas) {
                ctx.append("- ").append(t.get("nombre"))
                   .append(" | ").append(t.get("estatus"))
                   .append(" | Prioridad: ").append(t.get("prioridad"))
                   .append(" | ").append(t.get("descripcion"))
                   .append(" | Asignado: ").append(t.get("asignado"))
                   .append(" | Sprint: ").append(t.get("sprint"))
                   .append(" | Horas: ").append(t.get("horas_reales"))
                   .append("/").append(t.get("horas_estimadas")).append("\n");
            }
        }

        // KPIs más relevantes para la pregunta
        List<Map<String, Object>> kpis = runSql(
            "SELECT NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD " +
            "FROM ADMIN.KPIS WHERE PROYECTO_ID = " + proyectoId + " " +
            "ORDER BY VECTOR_DISTANCE(EMBEDDING, " + vectorExpr + ", COSINE) " +
            "FETCH FIRST 5 ROWS ONLY"
        );
        if (!kpis.isEmpty()) {
            ctx.append("\nKPIs:\n");
            for (Map<String, Object> k : kpis) {
                ctx.append("- ").append(k.get("nombre"))
                   .append(": ").append(k.get("valor_actual"))
                   .append("/").append(k.get("valor_meta"))
                   .append(" ").append(k.get("unidad"))
                   .append(" | ").append(k.get("descripcion")).append("\n");
            }
        }

        // Equipo más relevante para la pregunta
        List<Map<String, Object>> usuarios = runSql(
            "SELECT u.FULL_NAME, u.ROL, " +
            "COUNT(t.TAREA_ID) as TOTAL_TAREAS, " +
            "SUM(CASE WHEN t.ESTATUS != 'Completado' THEN 1 ELSE 0 END) as PENDIENTES " +
            "FROM ADMIN.USUARIOS u " +
            "JOIN ADMIN.TAREAS t ON t.ASIGNADO_A = u.USER_ID " +
            "WHERE t.PROYECTO_ID = " + proyectoId + " AND t.BORRADO = 0 " +
            "GROUP BY u.USER_ID, u.FULL_NAME, u.ROL, u.EMBEDDING " +
            "ORDER BY VECTOR_DISTANCE(MIN(u.EMBEDDING), " + vectorExpr + ", COSINE) " +
            "FETCH FIRST 5 ROWS ONLY"
        );
        if (!usuarios.isEmpty()) {
            ctx.append("\nEQUIPO:\n");
            for (Map<String, Object> u : usuarios) {
                ctx.append("- ").append(u.get("full_name"))
                   .append(" (").append(u.get("rol")).append(")")
                   .append(" | Tareas: ").append(u.get("total_tareas"))
                   .append(" total, ").append(u.get("pendientes")).append(" pendientes\n");
            }
        }

        // Historial reciente más relevante para la pregunta
        List<Map<String, Object>> historial = runSql(
            "SELECT th.CAMPO, th.VALOR_ANTERIOR, th.VALOR_NUEVO, " +
            "u.FULL_NAME as MODIFICADO_POR, " +
            "TO_CHAR(th.MODIFICADO_EN, 'YYYY-MM-DD HH24:MI') as FECHA, " +
            "t.NOMBRE as TAREA " +
            "FROM ADMIN.TAREA_HISTORIAL th " +
            "JOIN ADMIN.TAREAS t ON t.TAREA_ID = th.TAREA_ID " +
            "LEFT JOIN ADMIN.USUARIOS u ON u.USER_ID = th.MODIFICADO_POR " +
            "WHERE t.PROYECTO_ID = " + proyectoId + " " +
            "ORDER BY VECTOR_DISTANCE(th.EMBEDDING, " + vectorExpr + ", COSINE) " +
            "FETCH FIRST 8 ROWS ONLY"
        );
        if (!historial.isEmpty()) {
            ctx.append("\nHISTORIAL RELEVANTE:\n");
            for (Map<String, Object> h : historial) {
                ctx.append("- [").append(h.get("fecha")).append("] ")
                   .append(h.get("tarea")).append(": ")
                   .append(h.get("campo")).append(" cambió de '")
                   .append(h.get("valor_anterior")).append("' a '")
                   .append(h.get("valor_nuevo")).append("' por ")
                   .append(h.get("modificado_por")).append("\n");
            }
        }

        return ctx.toString();
    }

    // ── Función principal de RAG ─────────────────────────────────
    public String ask(Long proyectoId, String pregunta) throws Exception {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new IllegalStateException("GROQ_API_KEY no configurado");
        }

        String context = getContext(proyectoId, pregunta);

        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("model", GROQ_MODEL);
        requestBody.put("max_tokens", 600);

        ArrayNode messages = mapper.createArrayNode();

        ObjectNode systemMsg = mapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content",
            "Eres un asistente de gestión de proyectos.\n" +
            "Responde en español de forma clara y concisa.\n" +
            "Usa SOLO la información del contexto proporcionado.\n" +
            "Si no tienes suficiente información, dilo claramente.\n\n" +
            "CONTEXTO:\n" + context
        );
        messages.add(systemMsg);

        ObjectNode userMsg = mapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", pregunta);
        messages.add(userMsg);

        requestBody.set("messages", messages);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Groq API error: " + response.statusCode() + " " + response.body());
        }

        JsonNode respJson = mapper.readTree(response.body());
        return respJson.path("choices").get(0).path("message").path("content").asText("");
    }
}
