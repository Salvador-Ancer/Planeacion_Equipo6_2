package com.springboot.MyTodoList.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.Kpi;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.KpiService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UsuarioService;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions {

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);
    private static final Map<Long, UserSession> sessions = new ConcurrentHashMap<>();

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    ToDoItemService todoService;
    DeepSeekService deepSeekService;
    TareaService tareaService;
    SprintService sprintService;
    KpiService kpiService;
    UsuarioService usuarioService;

    public BotActions(TelegramClient tc, ToDoItemService ts, DeepSeekService ds,
                      TareaService tareas, SprintService sprints,
                      KpiService kpis, UsuarioService usuarios) {
        telegramClient = tc;
        todoService = ts;
        deepSeekService = ds;
        tareaService = tareas;
        sprintService = sprints;
        kpiService = kpis;
        usuarioService = usuarios;
        exit = false;
    }

    public void setRequestText(String cmd) { requestText = cmd; }
    public void setChatId(long chId) { chatId = chId; }
    public void setTelegramClient(TelegramClient tc) { telegramClient = tc; }
    public void setTodoService(ToDoItemService tsvc) { todoService = tsvc; }
    public ToDoItemService getTodoService() { return todoService; }
    public void setDeepSeekService(DeepSeekService dssvc) { deepSeekService = dssvc; }
    public DeepSeekService getDeepSeekService() { return deepSeekService; }

    // --- Helpers ---

    private Optional<Usuario> resolveUsuario() {
        return usuarioService.obtenerPorTelegram(chatId);
    }

    private String extraerContenidoLLM(String jsonResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return content.isEmpty() ? jsonResponse : content;
        } catch (Exception e) {
            logger.warn("No se pudo parsear respuesta LLM: {}", e.getMessage());
            return jsonResponse;
        }
    }

    private String escaparParaJson(String texto) {
        return texto
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    // --- Pantalla principal ---

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand())
                || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,
            ReplyKeyboardMarkup.builder()
                .resizeKeyboard(true)
                .keyboardRow(new KeyboardRow(BotLabels.MIS_TAREAS.getLabel(), BotLabels.KPI_SPRINT.getLabel()))
                .keyboardRow(new KeyboardRow(BotLabels.SPRINT_ACTIVO.getLabel(), BotLabels.BLOQUEOS.getLabel()))
                .keyboardRow(new KeyboardRow(BotLabels.RENDIMIENTO_EQUIPO.getLabel(), BotLabels.ANALIZAR_IA.getLabel()))
                .keyboardRow(new KeyboardRow(BotLabels.ADD_TAREA.getLabel(), BotLabels.ASIGNAR_SPRINT.getLabel()))
                .keyboardRow(new KeyboardRow(BotLabels.COMPLETAR_TAREA.getLabel()))
                .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                .build()
        );
        exit = true;
    }

    // --- Nuevas funcionalidades KPI / Rendimiento ---

    public void fnMisTareas() {
        if (!(requestText.equals(BotCommands.MIS_TAREAS.getCommand())
                || requestText.equals(BotLabels.MIS_TAREAS.getLabel())) || exit)
            return;

        Optional<Usuario> usuarioOpt = resolveUsuario();
        if (usuarioOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USUARIO_NO_REGISTRADO.getMessage(), telegramClient);
            exit = true;
            return;
        }

        Usuario usuario = usuarioOpt.get();
        List<Tarea> tareas = tareaService.obtenerPorAsignado(usuario.getId()).stream()
            .filter(t -> t.getBorrado() == null || t.getBorrado() == 0)
            .collect(Collectors.toList());

        if (tareas.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_TAREAS.getMessage(), telegramClient);
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Hola ").append(usuario.getFullName()).append("!\n");
        sb.append("Tus Tareas Asignadas (").append(tareas.size()).append(")\n\n");

        for (Tarea t : tareas) {
            String estado = t.getEstatus() != null ? t.getEstatus() : "Sin estatus";
            String prioridad = t.getPrioridad() != null ? t.getPrioridad() : "-";
            sb.append("- ").append(t.getNombre()).append("\n");
            sb.append("  Estado: ").append(estado).append(" | Prioridad: ").append(prioridad).append("\n");
            if (t.getStoryPoints() != null)
                sb.append("  Story Points: ").append(t.getStoryPoints()).append("\n");
            if (t.getFechaVencimiento() != null) {
                boolean vencida = t.getFechaVencimiento().before(new Date())
                    && !"Completado".equalsIgnoreCase(estado);
                sb.append("  Vence: ").append(t.getFechaVencimiento());
                if (vencida) sb.append(" [VENCIDA]");
                sb.append("\n");
            }
            sb.append("\n");
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnKpis() {
        if (!(requestText.equals(BotCommands.KPI_SPRINT.getCommand())
                || requestText.equals(BotLabels.KPI_SPRINT.getLabel())) || exit)
            return;

        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
        List<Kpi> kpis;
        String contextoSprint = "General";

        if (!sprintsActivos.isEmpty()) {
            Sprint sprint = sprintsActivos.get(0);
            contextoSprint = sprint.getNombre();
            kpis = kpiService.obtenerPorSprint(sprint.getId());
        } else {
            kpis = kpiService.obtenerTodos();
        }

        if (kpis.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_KPIS.getMessage(), telegramClient);
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("KPIs - ").append(contextoSprint).append("\n\n");

        for (Kpi kpi : kpis) {
            double actual = kpi.getValorActual() != null ? kpi.getValorActual() : 0;
            double meta = kpi.getValorMeta() != null ? kpi.getValorMeta() : 0;
            String unidad = kpi.getUnidad() != null ? kpi.getUnidad() : "";
            double porcentaje = meta > 0 ? (actual / meta) * 100 : 0;
            String estado = porcentaje >= 100 ? "[OK]" : porcentaje >= 70 ? "[ATENCION]" : "[CRITICO]";

            sb.append(estado).append(" ").append(kpi.getNombre()).append("\n");
            sb.append("  Actual: ").append(String.format("%.1f", actual)).append(" ").append(unidad);
            sb.append(" / Meta: ").append(String.format("%.1f", meta)).append(" ").append(unidad);
            sb.append(" (").append(String.format("%.0f", porcentaje)).append("%)\n");
            if (kpi.getDescripcion() != null && !kpi.getDescripcion().isEmpty())
                sb.append("  ").append(kpi.getDescripcion()).append("\n");
            sb.append("\n");
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnSprint() {
        if (!(requestText.equals(BotCommands.SPRINT_ACTIVO.getCommand())
                || requestText.equals(BotLabels.SPRINT_ACTIVO.getLabel())) || exit)
            return;

        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");

        if (sprintsActivos.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_SPRINT_ACTIVO.getMessage(), telegramClient);
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Sprint Activo\n\n");

        for (Sprint sprint : sprintsActivos) {
            sb.append(sprint.getNombre()).append("\n");
            if (sprint.getObjetivo() != null)
                sb.append("Objetivo: ").append(sprint.getObjetivo()).append("\n");
            if (sprint.getFechaInicio() != null)
                sb.append("Inicio: ").append(sprint.getFechaInicio()).append("\n");
            if (sprint.getFechaFin() != null)
                sb.append("Fin: ").append(sprint.getFechaFin()).append("\n");

            List<Tarea> tareasSprint = tareaService.obtenerPorSprint(sprint.getId()).stream()
                .filter(t -> t.getBorrado() == null || t.getBorrado() == 0)
                .collect(Collectors.toList());

            long completadas = tareasSprint.stream()
                .filter(t -> "Completado".equalsIgnoreCase(t.getEstatus())).count();
            long enProgreso = tareasSprint.stream()
                .filter(t -> "En Progreso".equalsIgnoreCase(t.getEstatus())).count();
            long pendientes = tareasSprint.stream()
                .filter(t -> "Backlog".equalsIgnoreCase(t.getEstatus())).count();
            long bloqueadas = tareasSprint.stream()
                .filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus())).count();

            int spTotal = tareasSprint.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
            int spCompletados = tareasSprint.stream()
                .filter(t -> "Completado".equalsIgnoreCase(t.getEstatus()))
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();

            double avance = tareasSprint.size() > 0
                ? ((double) completadas / tareasSprint.size()) * 100 : 0;

            sb.append("\nAvance: ").append(String.format("%.0f", avance)).append("%")
              .append(" | ").append(completadas).append("/").append(tareasSprint.size()).append(" completadas\n");
            sb.append("Completadas: ").append(completadas)
              .append(" | En progreso: ").append(enProgreso)
              .append(" | Backlog: ").append(pendientes)
              .append(" | Bloqueadas: ").append(bloqueadas).append("\n");
            sb.append("Story Points: ").append(spCompletados).append("/").append(spTotal).append("\n");

            if (!tareasSprint.isEmpty()) {
                sb.append("\nTAREAS:\n");
                sb.append("--------------------------------\n");
                for (Tarea t : tareasSprint) {
                    String estatus = t.getEstatus() != null ? t.getEstatus() : "-";
                    String prioridad = t.getPrioridad() != null ? "[" + t.getPrioridad().charAt(0) + "]" : "[-]";
                    String developer = "-";
                    if (t.getAsignadoA() != null) {
                        Optional<Usuario> u = usuarioService.obtenerPorId(t.getAsignadoA());
                        if (u.isPresent()) developer = u.get().getFullName();
                    }
                    String icono = "Completado".equalsIgnoreCase(estatus) ? "[OK]"
                        : "En Progreso".equalsIgnoreCase(estatus) ? "[>>]"
                        : "Bloqueado".equalsIgnoreCase(estatus) ? "[!]" : "[ ]";
                    sb.append(icono).append(" ").append(prioridad).append(" ")
                      .append(t.getNombre()).append("\n")
                      .append("    ").append(estatus).append(" | ").append(developer).append("\n");
                }
                sb.append("--------------------------------\n");
            }
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnBloqueos() {
        if (!(requestText.equals(BotCommands.BLOQUEOS.getCommand())
                || requestText.equals(BotLabels.BLOQUEOS.getLabel())) || exit)
            return;

        List<Tarea> todas;
        try {
            todas = tareaService.obtenerActivas();
        } catch (Exception e) {
            logger.error("Error en fnBloqueos al obtener tareas: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error al obtener tareas: " + e.getMessage(), telegramClient);
            exit = true;
            return;
        }
        Date ahora = new Date();

        List<Tarea> bloqueadas = todas.stream()
            .filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus()))
            .collect(Collectors.toList());

        List<Tarea> vencidas = todas.stream()
            .filter(t -> t.getFechaVencimiento() != null
                && t.getFechaVencimiento().before(ahora)
                && !"Completado".equalsIgnoreCase(t.getEstatus())
                && !"Bloqueado".equalsIgnoreCase(t.getEstatus()))
            .collect(Collectors.toList());

        if (bloqueadas.isEmpty() && vencidas.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_BLOQUEOS.getMessage(), telegramClient);
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Bloqueos y Retrasos Detectados\n\n");

        if (!bloqueadas.isEmpty()) {
            sb.append("[BLOQUEADAS] ").append(bloqueadas.size()).append(" tarea(s)\n");
            for (Tarea t : bloqueadas) {
                sb.append("  - ").append(t.getNombre());
                if (t.getPrioridad() != null)
                    sb.append(" [").append(t.getPrioridad()).append("]");
                sb.append("\n");
            }
            sb.append("\n");
        }

        if (!vencidas.isEmpty()) {
            sb.append("[VENCIDAS SIN COMPLETAR] ").append(vencidas.size()).append(" tarea(s)\n");
            for (Tarea t : vencidas) {
                sb.append("  - ").append(t.getNombre());
                sb.append(" (vencio: ").append(t.getFechaVencimiento()).append(")");
                if (t.getPrioridad() != null)
                    sb.append(" [").append(t.getPrioridad()).append("]");
                sb.append("\n");
            }
        }

        sb.append("\nUsa /analizar para recomendaciones de la IA.");
        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnRendimiento() {
        if (!(requestText.equals(BotCommands.RENDIMIENTO.getCommand())
                || requestText.equals(BotLabels.RENDIMIENTO_EQUIPO.getLabel())) || exit)
            return;

        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
        if (sprintsActivos.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_SPRINT_ACTIVO.getMessage(), telegramClient);
            exit = true;
            return;
        }

        Sprint sprint = sprintsActivos.get(0);
        List<Tarea> tareas = tareaService.obtenerPorSprint(sprint.getId()).stream()
            .filter(t -> t.getBorrado() == null || t.getBorrado() == 0)
            .collect(Collectors.toList());

        long total = tareas.size();
        long completadas = tareas.stream()
            .filter(t -> "Completado".equalsIgnoreCase(t.getEstatus())).count();
        long enProgreso = tareas.stream()
            .filter(t -> "En Progreso".equalsIgnoreCase(t.getEstatus())).count();
        long bloqueadas = tareas.stream()
            .filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus())).count();

        Date ahora = new Date();
        long vencidas = tareas.stream()
            .filter(t -> t.getFechaVencimiento() != null
                && t.getFechaVencimiento().before(ahora)
                && !"Completado".equalsIgnoreCase(t.getEstatus()))
            .count();

        double tasaCompletado = total > 0 ? ((double) completadas / total) * 100 : 0;

        int spTotal = tareas.stream()
            .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
        int spCompletados = tareas.stream()
            .filter(t -> "Completado".equalsIgnoreCase(t.getEstatus()))
            .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();

        double horasEst = tareas.stream()
            .mapToDouble(t -> t.getHorasEstimadas() != null ? t.getHorasEstimadas() : 0).sum();
        double horasReal = tareas.stream()
            .mapToDouble(t -> t.getHorasReales() != null ? t.getHorasReales() : 0).sum();

        String nivelRendimiento = tasaCompletado >= 80 ? "BUENO" : tasaCompletado >= 50 ? "REGULAR" : "BAJO";

        StringBuilder sb = new StringBuilder();
        sb.append("Rendimiento del Equipo\n");
        sb.append("Sprint: ").append(sprint.getNombre()).append("\n");
        sb.append("Nivel: [").append(nivelRendimiento).append("]\n\n");
        sb.append("Completado: ").append(String.format("%.1f", tasaCompletado)).append("%\n");
        sb.append("Tareas completadas: ").append(completadas).append("/").append(total).append("\n");
        sb.append("En progreso: ").append(enProgreso).append("\n");
        sb.append("Bloqueadas: ").append(bloqueadas).append("\n");
        sb.append("Vencidas sin completar: ").append(vencidas).append("\n\n");

        sb.append("Velocidad (Story Points)\n");
        sb.append("  Completados: ").append(spCompletados).append("/").append(spTotal).append("\n");
        if (spTotal > 0)
            sb.append("  Tasa: ").append(String.format("%.0f", ((double) spCompletados / spTotal) * 100)).append("%\n");

        if (horasEst > 0) {
            sb.append("\nEstimacion vs Real\n");
            sb.append("  Estimadas: ").append(String.format("%.1f", horasEst)).append("h\n");
            sb.append("  Reales: ").append(String.format("%.1f", horasReal)).append("h\n");
            double precision = (horasReal / horasEst) * 100;
            String precisionLabel = precision <= 110 ? "Buena estimacion"
                : precision <= 130 ? "Ligero sobrepaso" : "Sobrepaso significativo";
            sb.append("  ").append(precisionLabel)
              .append(" (").append(String.format("%.0f", precision)).append("%)\n");
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnAnalizar() {
        if (!(requestText.equals(BotCommands.ANALIZAR.getCommand())
                || requestText.equals(BotLabels.ANALIZAR_IA.getLabel())) || exit)
            return;

        try {
            List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
            StringBuilder sb = new StringBuilder("Analisis del Equipo\n\n");

            if (sprintsActivos.isEmpty()) {
                sb.append("No hay sprint activo en este momento.\n\n");
                List<Tarea> todas = tareaService.obtenerActivas();
                long bloqueadas = todas.stream()
                    .filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus())).count();
                sb.append("Tareas activas: ").append(todas.size()).append("\n");
                sb.append("Bloqueadas: ").append(bloqueadas).append("\n");
                sb.append("\nRecomendacion: Inicia un nuevo sprint para organizar el trabajo pendiente.");
                BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
                exit = true;
                return;
            }

            Sprint sprint = sprintsActivos.get(0);
            List<Tarea> tareas = tareaService.obtenerPorSprint(sprint.getId()).stream()
                .filter(t -> t.getBorrado() == null || t.getBorrado() == 0)
                .collect(Collectors.toList());

            long completadas = tareas.stream().filter(t -> "Completado".equalsIgnoreCase(t.getEstatus())).count();
            long enProgreso = tareas.stream().filter(t -> "En Progreso".equalsIgnoreCase(t.getEstatus())).count();
            long pendientes = tareas.stream().filter(t -> "Backlog".equalsIgnoreCase(t.getEstatus())).count();
            long bloqueadas = tareas.stream().filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus())).count();
            int total = tareas.size();

            double horasEst = tareas.stream()
                .mapToDouble(t -> t.getHorasEstimadas() != null ? t.getHorasEstimadas() : 0).sum();
            double horasReal = tareas.stream()
                .mapToDouble(t -> t.getHorasReales() != null ? t.getHorasReales() : 0).sum();

            double pctCompletado = total > 0 ? (completadas * 100.0 / total) : 0;

            // 1) Resumen ejecutivo
            sb.append("1. Resumen ejecutivo\n");
            sb.append("El sprint \"").append(sprint.getNombre()).append("\" tiene ");
            sb.append(total).append(" tareas: ").append(completadas).append(" completadas (")
              .append(String.format("%.0f", pctCompletado)).append("%), ")
              .append(enProgreso).append(" en progreso y ").append(pendientes).append(" pendientes. ");

            if (horasEst > 0) {
                double eficiencia = horasReal / horasEst * 100;
                sb.append("Se han usado ").append(String.format("%.1f", horasReal))
                  .append("h de ").append(String.format("%.1f", horasEst))
                  .append("h estimadas (").append(String.format("%.0f", eficiencia)).append("%).\n\n");
            } else {
                sb.append("\n\n");
            }

            // 2) Riesgos
            sb.append("2. Riesgos detectados\n");
            if (bloqueadas > 0) {
                sb.append("- ").append(bloqueadas).append(" tarea(s) bloqueada(s) que pueden retrasar el sprint.\n");
                tareas.stream().filter(t -> "Bloqueado".equalsIgnoreCase(t.getEstatus()))
                    .forEach(t -> sb.append("  * ").append(t.getNombre()).append("\n"));
            }
            if (pctCompletado < 30 && total > 3) {
                sb.append("- Avance bajo (").append(String.format("%.0f", pctCompletado))
                  .append("% completado). Riesgo de no terminar el sprint a tiempo.\n");
            }
            if (horasEst > 0 && horasReal > horasEst * 1.2) {
                sb.append("- Las horas reales superan las estimadas en mas del 20%. Revisar estimaciones.\n");
            }
            if (bloqueadas == 0 && pctCompletado >= 30) {
                sb.append("- Sin riesgos criticos identificados en este momento.\n");
            }
            sb.append("\n");

            // 3) Recomendaciones
            sb.append("3. Recomendaciones\n");
            if (bloqueadas > 0)
                sb.append("- Resolver los bloqueos de forma prioritaria en la proxima reunion del equipo.\n");
            if (pendientes > enProgreso * 2)
                sb.append("- Hay muchas tareas en Backlog. Considera mover las mas prioritarias a En Progreso.\n");
            if (horasEst > 0 && horasReal < horasEst * 0.5 && completadas < total)
                sb.append("- El equipo va adelante en tiempo. Aprovecha para revisar la calidad del entregable.\n");
            sb.append("- Mantener dailys cortos para detectar bloqueos rapidamente.\n");
            if (completadas == total && total > 0)
                sb.append("- Sprint completado al 100%. Excelente trabajo del equipo!\n");

            BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        } catch (Exception e) {
            logger.error("Error en fnAnalizar: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error al generar el analisis. Intenta de nuevo.", telegramClient);
        }

        exit = true;
    }

    // --- Agregar tarea ---

    public void fnAddTarea() {
        boolean esComando = requestText.equals(BotCommands.ADD_TAREA.getCommand())
            || requestText.equals(BotLabels.ADD_TAREA.getLabel());

        UserSession session = sessions.computeIfAbsent(chatId, k -> new UserSession());

        if (!esComando && session.getState() == UserSession.State.NONE) return;
        if (exit) return;

        Optional<Usuario> usuarioOpt = resolveUsuario();
        if (usuarioOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USUARIO_NO_REGISTRADO.getMessage(), telegramClient);
            session.reset();
            exit = true;
            return;
        }

        if (esComando && session.getState() == UserSession.State.NONE) {
            session.setState(UserSession.State.ESPERANDO_NOMBRE_TAREA);
            BotHelper.sendMessageToTelegram(chatId, "Nueva Tarea\n\nEscribe el nombre de la tarea:", telegramClient);
            exit = true;
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_NOMBRE_TAREA) {
            session.setNombreTarea(requestText);
            session.setState(UserSession.State.ESPERANDO_HORAS_ESTIMADAS);
            BotHelper.sendMessageToTelegram(chatId, "Horas estimadas (maximo 4):", telegramClient);
            exit = true;
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_HORAS_ESTIMADAS) {
            try {
                double horas = Double.parseDouble(requestText.replace(",", "."));
                if (horas > 4) {
                    BotHelper.sendMessageToTelegram(chatId,
                        "La tarea no puede tener mas de 4 horas estimadas (recomendacion Oracle).\n"
                        + "Subdivide la tarea en partes mas pequenas.\n\nIngresa las horas (maximo 4):", telegramClient);
                    exit = true;
                    return;
                }
                session.setHorasEstimadas(horas);
                session.setState(UserSession.State.ESPERANDO_PRIORIDAD);
                BotHelper.sendMessageToTelegram(chatId, "Prioridad:",
                    telegramClient,
                    ReplyKeyboardMarkup.builder()
                        .resizeKeyboard(true)
                        .oneTimeKeyboard(true)
                        .keyboardRow(new KeyboardRow("Alta", "Media"))
                        .keyboardRow(new KeyboardRow("Baja"))
                        .build());
            } catch (NumberFormatException e) {
                BotHelper.sendMessageToTelegram(chatId, "Ingresa un numero valido (ej: 2 o 1.5):", telegramClient);
            }
            exit = true;
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_PRIORIDAD) {
            String prioridad = requestText.trim();
            if (!prioridad.equals("Alta") && !prioridad.equals("Media") && !prioridad.equals("Baja")) {
                BotHelper.sendMessageToTelegram(chatId, "Selecciona: Alta, Media o Baja", telegramClient);
                exit = true;
                return;
            }
            session.setPrioridad(prioridad);

            Usuario usuario = usuarioOpt.get();
            boolean esDeveloper = "Developer".equalsIgnoreCase(usuario.getRol());

            if (esDeveloper) {
                // Developer: se asigna a sí mismo
                crearTarea(session, usuario.getId(), usuario.getId());
                session.reset();
                exit = true;
            } else {
                // Admin/Scrum Master/Product Owner: elegir developer
                List<Usuario> developers = usuarioService.obtenerDevelopers();
                if (developers.isEmpty()) {
                    BotHelper.sendMessageToTelegram(chatId, "No hay developers registrados.", telegramClient);
                    session.reset();
                    exit = true;
                    return;
                }
                StringBuilder msg = new StringBuilder("Asignar a developer:\n\n");
                for (Usuario dev : developers) {
                    msg.append(dev.getId()).append(" - ").append(dev.getFullName()).append("\n");
                }
                msg.append("\nEscribe el numero del developer:");

                List<KeyboardRow> rows = new ArrayList<>();
                for (Usuario dev : developers) {
                    rows.add(new KeyboardRow(dev.getId() + " - " + dev.getFullName()));
                }
                BotHelper.sendMessageToTelegram(chatId, msg.toString(),
                    telegramClient,
                    ReplyKeyboardMarkup.builder()
                        .resizeKeyboard(true)
                        .oneTimeKeyboard(true)
                        .keyboard(rows)
                        .build());
                session.setState(UserSession.State.ESPERANDO_DEVELOPER);
                exit = true;
            }
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_DEVELOPER) {
            String input = requestText.trim();
            Long devId = null;
            // Acepta "3 - Juan Hernandez" o solo "3"
            try {
                devId = Long.parseLong(input.split(" ")[0]);
            } catch (NumberFormatException e) {
                BotHelper.sendMessageToTelegram(chatId, "Selecciona un developer de la lista.", telegramClient);
                exit = true;
                return;
            }
            Optional<Usuario> devOpt = usuarioService.obtenerPorId(devId);
            if (devOpt.isEmpty() || !"Developer".equalsIgnoreCase(devOpt.get().getRol())) {
                BotHelper.sendMessageToTelegram(chatId, "Developer no encontrado. Intenta de nuevo:", telegramClient);
                exit = true;
                return;
            }
            Usuario creador = usuarioOpt.get();
            crearTarea(session, devId, creador.getId());
            session.reset();
            exit = true;
        }
    }

    private void crearTarea(UserSession session, Long asignadoA, Long creadoPor) {
        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
        Tarea tarea = new Tarea();
        tarea.setNombre(session.getNombreTarea());
        tarea.setHorasEstimadas(session.getHorasEstimadas());
        tarea.setPrioridad(session.getPrioridad());
        tarea.setEstatus("Backlog");
        tarea.setAsignadoA(asignadoA);
        tarea.setCreadoPor(creadoPor);
        tarea.setFechaCreacion(new Date());
        tarea.setBorrado(0);
        if (!sprintsActivos.isEmpty())
            tarea.setSprintId(sprintsActivos.get(0).getId());

        List<Tarea> todas = tareaService.obtenerTodas();
        long maxId = todas.stream().mapToLong(t -> t.getId() != null ? t.getId() : 0).max().orElse(0);
        tarea.setId(maxId + 1);

        tareaService.guardar(tarea);

        Optional<Usuario> devOpt = usuarioService.obtenerPorId(asignadoA);
        String devNombre = devOpt.map(Usuario::getFullName).orElse("ID " + asignadoA);

        BotHelper.sendMessageToTelegram(chatId,
            "Tarea creada!\n\n"
            + "Nombre: " + tarea.getNombre() + "\n"
            + "Horas estimadas: " + tarea.getHorasEstimadas() + "h\n"
            + "Prioridad: " + tarea.getPrioridad() + "\n"
            + "Asignada a: " + devNombre + "\n"
            + "Estatus: Backlog\n"
            + "ID: " + tarea.getId(),
            telegramClient);
    }

    // --- Asignar tarea a sprint (marcar En Progreso) ---

    public void fnAsignarSprint() {
        boolean esComando = requestText.equals(BotCommands.ASIGNAR_SPRINT.getCommand())
            || requestText.equals(BotLabels.ASIGNAR_SPRINT.getLabel());

        UserSession session = sessions.computeIfAbsent(chatId, k -> new UserSession());

        if (!esComando && session.getState() != UserSession.State.ESPERANDO_ID_COMPLETAR) {
            // reusar estado para asignar sprint
        }
        if (exit) return;

        if (!esComando) return;

        Optional<Usuario> usuarioOpt = resolveUsuario();
        if (usuarioOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USUARIO_NO_REGISTRADO.getMessage(), telegramClient);
            exit = true;
            return;
        }

        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
        if (sprintsActivos.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.SIN_SPRINT_ACTIVO.getMessage(), telegramClient);
            exit = true;
            return;
        }

        Usuario usuario = usuarioOpt.get();
        List<Tarea> misTareas = tareaService.obtenerPorAsignado(usuario.getId()).stream()
            .filter(t -> (t.getBorrado() == null || t.getBorrado() == 0)
                && "Backlog".equalsIgnoreCase(t.getEstatus()))
            .collect(Collectors.toList());

        if (misTareas.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No tienes tareas en Backlog para iniciar.", telegramClient);
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder("Tus tareas en Backlog:\n\n");
        for (Tarea t : misTareas) {
            sb.append("ID ").append(t.getId()).append(": ").append(t.getNombre())
              .append(" [").append(t.getPrioridad()).append("]\n");
        }
        sb.append("\nResponde con el ID de la tarea a iniciar:");
        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        session.setState(UserSession.State.ESPERANDO_ID_COMPLETAR);
        session.setTareaIdACompletar(-1L); // flag para saber que es asignar sprint
        exit = true;
    }

    // --- Completar tarea ---

    public void fnCompletarTarea() {
        boolean esComando = requestText.equals(BotCommands.COMPLETAR_TAREA.getCommand())
            || requestText.equals(BotLabels.COMPLETAR_TAREA.getLabel());

        UserSession session = sessions.computeIfAbsent(chatId, k -> new UserSession());

        if (!esComando && session.getState() != UserSession.State.ESPERANDO_ID_COMPLETAR
                && session.getState() != UserSession.State.ESPERANDO_HORAS_REALES) return;
        if (exit) return;

        Optional<Usuario> usuarioOpt = resolveUsuario();
        if (usuarioOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USUARIO_NO_REGISTRADO.getMessage(), telegramClient);
            session.reset();
            exit = true;
            return;
        }

        if (esComando && session.getState() == UserSession.State.NONE) {
            Usuario usuario = usuarioOpt.get();
            List<Tarea> misTareas = tareaService.obtenerPorAsignado(usuario.getId()).stream()
                .filter(t -> (t.getBorrado() == null || t.getBorrado() == 0)
                    && !"Completado".equalsIgnoreCase(t.getEstatus()))
                .collect(Collectors.toList());

            if (misTareas.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No tienes tareas activas para completar.", telegramClient);
                exit = true;
                return;
            }

            StringBuilder sb = new StringBuilder("Tus tareas activas:\n\n");
            for (Tarea t : misTareas) {
                sb.append("ID ").append(t.getId()).append(": ").append(t.getNombre())
                  .append(" [").append(t.getEstatus()).append("]\n");
            }
            sb.append("\nResponde con el ID de la tarea completada:");
            BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
            session.setState(UserSession.State.ESPERANDO_ID_COMPLETAR);
            session.setTareaIdACompletar(0L); // flag para completar
            exit = true;
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_ID_COMPLETAR) {
            try {
                long tareaId = Long.parseLong(requestText.trim());
                Optional<Tarea> tareaOpt = tareaService.obtenerPorId(tareaId);
                if (tareaOpt.isEmpty()) {
                    BotHelper.sendMessageToTelegram(chatId, "No encontre una tarea con ese ID. Intenta de nuevo:", telegramClient);
                    exit = true;
                    return;
                }
                Tarea tarea = tareaOpt.get();

                // Si es asignar a sprint (flag -1)
                if (session.getTareaIdACompletar() != null && session.getTareaIdACompletar() == -1L) {
                    List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");
                    tarea.setEstatus("En Progreso");
                    tarea.setActualizadoEn(new Date());
                    if (!sprintsActivos.isEmpty())
                        tarea.setSprintId(sprintsActivos.get(0).getId());
                    tareaService.guardar(tarea);
                    session.reset();
                    BotHelper.sendMessageToTelegram(chatId,
                        "Tarea iniciada!\n\n"
                        + "\"" + tarea.getNombre() + "\"\n"
                        + "Estatus: En Progreso\n"
                        + "Sprint: " + (sprintsActivos.isEmpty() ? "Sin sprint" : sprintsActivos.get(0).getNombre()),
                        telegramClient);
                    exit = true;
                    return;
                }

                session.setTareaIdACompletar(tareaId);
                session.setState(UserSession.State.ESPERANDO_HORAS_REALES);
                BotHelper.sendMessageToTelegram(chatId, "Horas reales trabajadas en \"" + tarea.getNombre() + "\":", telegramClient);
            } catch (NumberFormatException e) {
                BotHelper.sendMessageToTelegram(chatId, "Ingresa un ID valido (numero):", telegramClient);
            }
            exit = true;
            return;
        }

        if (session.getState() == UserSession.State.ESPERANDO_HORAS_REALES) {
            try {
                double horasReales = Double.parseDouble(requestText.replace(",", "."));
                Optional<Tarea> tareaOpt = tareaService.obtenerPorId(session.getTareaIdACompletar());
                if (tareaOpt.isPresent()) {
                    Tarea tarea = tareaOpt.get();
                    tarea.setEstatus("Completado");
                    tarea.setHorasReales(horasReales);
                    tarea.setActualizadoEn(new Date());
                    tareaService.guardar(tarea);
                    session.reset();
                    BotHelper.sendMessageToTelegram(chatId,
                        "Tarea completada!\n\n"
                        + "\"" + tarea.getNombre() + "\"\n"
                        + "Horas estimadas: " + (tarea.getHorasEstimadas() != null ? tarea.getHorasEstimadas() + "h" : "-") + "\n"
                        + "Horas reales: " + horasReales + "h",
                        telegramClient);
                }
            } catch (NumberFormatException e) {
                BotHelper.sendMessageToTelegram(chatId, "Ingresa un numero valido (ej: 2 o 1.5):", telegramClient);
            }
            exit = true;
        }
    }

    // --- Comandos legacy (TodoItem) ---

    public void fnDone() {
        if (requestText.indexOf(BotLabels.DONE.getLabel()) == -1 || exit)
            return;

        String done = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(done);

        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(true);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnUndo() {
        if (requestText.indexOf(BotLabels.UNDO.getLabel()) == -1 || exit)
            return;

        String undo = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(undo);

        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(false);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete() {
        if (requestText.indexOf(BotLabels.DELETE.getLabel()) == -1 || exit)
            return;

        String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(delete);

        try {
            todoService.deleteToDoItem(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnHide() {
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
                || requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit)
            BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        else
            return;
        exit = true;
    }

    public void fnListAll() {
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
                || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                || requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;

        List<ToDoItem> allItems = todoService.findAll();
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .selective(true)
            .build();

        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow firstRow = new KeyboardRow();
        firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(firstRow);

        KeyboardRow myTodoListTitleRow = new KeyboardRow();
        myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
        keyboard.add(myTodoListTitleRow);

        List<ToDoItem> activeItems = allItems.stream()
            .filter(item -> !item.isDone()).collect(Collectors.toList());

        for (ToDoItem item : activeItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(item.getDescription());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
            keyboard.add(currentRow);
        }

        List<ToDoItem> doneItems = allItems.stream()
            .filter(item -> item.isDone()).collect(Collectors.toList());

        for (ToDoItem item : doneItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(item.getDescription());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
            keyboard.add(currentRow);
        }

        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);
        BotHelper.sendMessageToTelegram(chatId, BotLabels.MY_TODO_LIST.getLabel(), telegramClient, keyboardMarkup);
        exit = true;
    }

    public void fnAddItem() {
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
                || requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit)
            return;
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        exit = true;
    }

    public void fnElse() {
        if (exit)
            return;
        ToDoItem newItem = new ToDoItem();
        newItem.setDescription(requestText);
        newItem.setCreation_ts(OffsetDateTime.now());
        newItem.setDone(false);
        todoService.addToDoItem(newItem);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }
}
