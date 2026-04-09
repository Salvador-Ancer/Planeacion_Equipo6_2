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
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions {

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

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
                    && !"COMPLETADO".equalsIgnoreCase(estado);
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
                .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus())).count();
            long enProgreso = tareasSprint.stream()
                .filter(t -> "EN_PROGRESO".equalsIgnoreCase(t.getEstatus())).count();
            long pendientes = tareasSprint.stream()
                .filter(t -> "PENDIENTE".equalsIgnoreCase(t.getEstatus())).count();
            long bloqueadas = tareasSprint.stream()
                .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus())).count();

            int spTotal = tareasSprint.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
            int spCompletados = tareasSprint.stream()
                .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus()))
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();

            double avance = tareasSprint.size() > 0
                ? ((double) completadas / tareasSprint.size()) * 100 : 0;

            sb.append("\nTareas: ").append(tareasSprint.size())
              .append(" total | Avance: ").append(String.format("%.0f", avance)).append("%\n");
            sb.append("  Completadas: ").append(completadas).append("\n");
            sb.append("  En progreso: ").append(enProgreso).append("\n");
            sb.append("  Pendientes:  ").append(pendientes).append("\n");
            sb.append("  Bloqueadas:  ").append(bloqueadas).append("\n");
            sb.append("  Story Points: ").append(spCompletados).append("/").append(spTotal).append("\n");
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient);
        exit = true;
    }

    public void fnBloqueos() {
        if (!(requestText.equals(BotCommands.BLOQUEOS.getCommand())
                || requestText.equals(BotLabels.BLOQUEOS.getLabel())) || exit)
            return;

        List<Tarea> todas = tareaService.obtenerActivas();
        Date ahora = new Date();

        List<Tarea> bloqueadas = todas.stream()
            .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus()))
            .collect(Collectors.toList());

        List<Tarea> vencidas = todas.stream()
            .filter(t -> t.getFechaVencimiento() != null
                && t.getFechaVencimiento().before(ahora)
                && !"COMPLETADO".equalsIgnoreCase(t.getEstatus())
                && !"BLOQUEADO".equalsIgnoreCase(t.getEstatus()))
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
            .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus())).count();
        long enProgreso = tareas.stream()
            .filter(t -> "EN_PROGRESO".equalsIgnoreCase(t.getEstatus())).count();
        long bloqueadas = tareas.stream()
            .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus())).count();

        Date ahora = new Date();
        long vencidas = tareas.stream()
            .filter(t -> t.getFechaVencimiento() != null
                && t.getFechaVencimiento().before(ahora)
                && !"COMPLETADO".equalsIgnoreCase(t.getEstatus()))
            .count();

        double tasaCompletado = total > 0 ? ((double) completadas / total) * 100 : 0;

        int spTotal = tareas.stream()
            .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
        int spCompletados = tareas.stream()
            .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus()))
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

        BotHelper.sendMessageToTelegram(chatId, BotMessages.ANALIZANDO.getMessage(), telegramClient);

        StringBuilder contexto = new StringBuilder();
        List<Sprint> sprintsActivos = sprintService.obtenerPorEstatus("ACTIVO");

        if (!sprintsActivos.isEmpty()) {
            Sprint sprint = sprintsActivos.get(0);
            contexto.append("SPRINT ACTIVO: ").append(sprint.getNombre()).append("\n");
            if (sprint.getObjetivo() != null)
                contexto.append("Objetivo: ").append(sprint.getObjetivo()).append("\n");

            List<Tarea> tareas = tareaService.obtenerPorSprint(sprint.getId()).stream()
                .filter(t -> t.getBorrado() == null || t.getBorrado() == 0)
                .collect(Collectors.toList());

            long completadas = tareas.stream()
                .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus())).count();
            long enProgreso = tareas.stream()
                .filter(t -> "EN_PROGRESO".equalsIgnoreCase(t.getEstatus())).count();
            long pendientes = tareas.stream()
                .filter(t -> "PENDIENTE".equalsIgnoreCase(t.getEstatus())).count();
            long bloqueadas = tareas.stream()
                .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus())).count();

            Date ahora = new Date();
            List<Tarea> tareasBloqueadasNombres = tareas.stream()
                .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus()))
                .collect(Collectors.toList());
            List<Tarea> tareasVencidas = tareas.stream()
                .filter(t -> t.getFechaVencimiento() != null
                    && t.getFechaVencimiento().before(ahora)
                    && !"COMPLETADO".equalsIgnoreCase(t.getEstatus()))
                .collect(Collectors.toList());

            int spTotal = tareas.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
            int spCompletados = tareas.stream()
                .filter(t -> "COMPLETADO".equalsIgnoreCase(t.getEstatus()))
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
            double horasEst = tareas.stream()
                .mapToDouble(t -> t.getHorasEstimadas() != null ? t.getHorasEstimadas() : 0).sum();
            double horasReal = tareas.stream()
                .mapToDouble(t -> t.getHorasReales() != null ? t.getHorasReales() : 0).sum();

            contexto.append("\nTAREAS (total: ").append(tareas.size()).append(")\n");
            contexto.append("  Completadas: ").append(completadas).append("\n");
            contexto.append("  En progreso: ").append(enProgreso).append("\n");
            contexto.append("  Pendientes: ").append(pendientes).append("\n");
            contexto.append("  Bloqueadas: ").append(bloqueadas).append("\n");
            contexto.append("  Vencidas sin completar: ").append(tareasVencidas.size()).append("\n");
            contexto.append("  Story Points: ").append(spCompletados).append("/").append(spTotal).append("\n");
            if (horasEst > 0)
                contexto.append("  Horas estimadas/reales: ").append(horasEst).append("h / ").append(horasReal).append("h\n");

            if (!tareasBloqueadasNombres.isEmpty()) {
                contexto.append("\nTAREAS BLOQUEADAS:\n");
                tareasBloqueadasNombres.forEach(t ->
                    contexto.append("  - ").append(t.getNombre())
                        .append(" [").append(t.getPrioridad()).append("]\n"));
            }

            if (!tareasVencidas.isEmpty()) {
                contexto.append("\nTAREAS VENCIDAS:\n");
                tareasVencidas.forEach(t ->
                    contexto.append("  - ").append(t.getNombre())
                        .append(" (vencio: ").append(t.getFechaVencimiento()).append(")\n"));
            }

            List<Kpi> kpis = kpiService.obtenerPorSprint(sprint.getId());
            if (!kpis.isEmpty()) {
                contexto.append("\nKPIs:\n");
                for (Kpi kpi : kpis) {
                    double actual = kpi.getValorActual() != null ? kpi.getValorActual() : 0;
                    double meta = kpi.getValorMeta() != null ? kpi.getValorMeta() : 0;
                    double pct = meta > 0 ? (actual / meta) * 100 : 0;
                    contexto.append("  - ").append(kpi.getNombre()).append(": ")
                        .append(String.format("%.1f", actual)).append("/")
                        .append(String.format("%.1f", meta))
                        .append(" ").append(kpi.getUnidad() != null ? kpi.getUnidad() : "")
                        .append(" (").append(String.format("%.0f", pct)).append("% del objetivo)\n");
                }
            }
        } else {
            List<Tarea> todas = tareaService.obtenerActivas();
            contexto.append("No hay sprint activo.\n");
            contexto.append("Tareas activas totales: ").append(todas.size()).append("\n");
            long bloqueadas = todas.stream()
                .filter(t -> "BLOQUEADO".equalsIgnoreCase(t.getEstatus())).count();
            contexto.append("Bloqueadas: ").append(bloqueadas).append("\n");
        }

        String prompt = "Eres un asistente experto en gestion de proyectos de software para equipos de Oracle. "
            + "Analiza los siguientes datos del equipo y responde en espanol con: "
            + "1) Resumen ejecutivo del rendimiento (2-3 oraciones). "
            + "2) Los 2-3 principales riesgos o bloqueos detectados. "
            + "3) Tres recomendaciones concretas y accionables para mejorar la productividad. "
            + "Se directo, usa numeros cuando puedas y se especifico.\n\n"
            + "DATOS DEL EQUIPO:\n"
            + contexto.toString();

        try {
            String rawResponse = deepSeekService.generateText(escaparParaJson(prompt));
            String contenido = extraerContenidoLLM(rawResponse);
            BotHelper.sendMessageToTelegram(chatId, "Analisis IA\n\n" + contenido, telegramClient);
        } catch (Exception e) {
            logger.error("Error llamando DeepSeek: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ERROR_LLM.getMessage(), telegramClient);
        }

        exit = true;
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
