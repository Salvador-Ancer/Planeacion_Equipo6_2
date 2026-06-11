package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

/**
 * Mantiene actualizada la columna EMBEDDING (VECTOR) de cada tabla
 * cuando sus datos de texto cambian, para que la búsqueda semántica
 * de RagService refleje siempre la información más reciente.
 */
@Service
public class EmbeddingSyncService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingSyncService.class);
    private static final String ORDS_USER = "ADMIN";
    private static final String EMBEDDING_MODEL = "ALL_MINILM_L12_V2";

    @Value("${ords.base.url}")
    private String ordsBaseUrl;

    @Value("${ords.password}")
    private String ordsPassword;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private void runSql(String statement) {
        try {
            String credentials = Base64.getEncoder()
                    .encodeToString((ORDS_USER + ":" + ordsPassword).getBytes());

            ObjectNode body = mapper.createObjectNode();
            body.put("statementText", statement);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ordsBaseUrl + "/_/sql"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + credentials)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("No se pudo actualizar el embedding ({}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Error actualizando embedding: {}", e.getMessage());
        }
    }

    public void syncTarea(Long tareaId) {
        runSql(
            "UPDATE ADMIN.TAREAS t SET t.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(t.NOMBRE,' ') || ' ' || NVL(t.ESTATUS,' ') || ' ' || NVL(t.PRIORIDAD,' ') || ' ' || NVL(t.DESCRIPCION,' ') AS data) " +
            "WHERE t.TAREA_ID = " + tareaId
        );
    }

    public void syncTareaHistorial(Long historialId) {
        runSql(
            "UPDATE ADMIN.TAREA_HISTORIAL th SET th.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(th.CAMPO,' ') || ' cambio de ' || NVL(th.VALOR_ANTERIOR,' ') || ' a ' || NVL(th.VALOR_NUEVO,' ') AS data) " +
            "WHERE th.HISTORIAL_ID = " + historialId
        );
    }

    public void syncProyecto(Long proyectoId) {
        runSql(
            "UPDATE ADMIN.PROYECTOS p SET p.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(p.NOMBRE,' ') || ' ' || NVL(p.ESTATUS,' ') || ' ' || NVL(p.DESCRIPCION,' ') AS data) " +
            "WHERE p.PROYECTO_ID = " + proyectoId
        );
    }

    public void syncSprint(Long sprintId) {
        runSql(
            "UPDATE ADMIN.SPRINTS s SET s.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(s.NOMBRE,' ') || ' ' || NVL(s.ESTATUS,' ') || ' ' || NVL(s.OBJETIVO,' ') AS data) " +
            "WHERE s.SPRINT_ID = " + sprintId
        );
    }

    public void syncKpi(Long kpiId) {
        runSql(
            "UPDATE ADMIN.KPIS k SET k.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(k.NOMBRE,' ') || ' ' || NVL(k.DESCRIPCION,' ') || ' ' || NVL(k.UNIDAD,' ') AS data) " +
            "WHERE k.KPI_ID = " + kpiId
        );
    }

    public void syncUsuario(Long userId) {
        runSql(
            "UPDATE ADMIN.USUARIOS u SET u.EMBEDDING = VECTOR_EMBEDDING(" + EMBEDDING_MODEL + " USING " +
            "NVL(u.FULL_NAME,' ') || ' ' || NVL(u.ROL,' ') AS data) " +
            "WHERE u.USER_ID = " + userId
        );
    }
}
