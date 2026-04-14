package com.springboot.MyTodoList.util;

public enum BotMessages {

	HELLO_MYTODO_BOT(
		"Hola! Soy el bot de rendimiento de equipo Oracle.\n\n" +
		"Puedes consultar:\n" +
		"- Mis Tareas: tareas asignadas a ti\n" +
		"- KPIs del Sprint: metricas del sprint activo\n" +
		"- Sprint Activo: estado y avance del sprint\n" +
		"- Bloqueos: tareas bloqueadas o vencidas\n" +
		"- Rendimiento del Equipo: resumen de productividad\n" +
		"- Analizar con IA: analisis inteligente con DeepSeek\n\n" +
		"Selecciona una opcion:"),
	BOT_REGISTERED_STARTED("Bot registrado y corriendo!"),
	ITEM_DONE("Tarea marcada como completada. Usa /todolist para ver la lista o /start para el menu principal."),
	ITEM_UNDONE("Tarea marcada como pendiente. Usa /todolist para ver la lista o /start para el menu principal."),
	ITEM_DELETED("Tarea eliminada. Usa /todolist para ver la lista o /start para el menu principal."),
	TYPE_NEW_TODO_ITEM("Escribe el nuevo elemento y presiona enviar."),
	NEW_ITEM_ADDED("Elemento agregado. Usa /todolist para ver la lista o /start para el menu principal."),
	BYE("Hasta luego! Usa /start para volver."),
	USUARIO_NO_REGISTRADO("Tu usuario de Telegram no esta registrado en el sistema. Pide a tu administrador que registre tu Telegram ID."),
	SIN_TAREAS("No tienes tareas asignadas en este momento."),
	SIN_KPIS("No hay KPIs registrados para el sprint activo."),
	SIN_SPRINT_ACTIVO("No hay un sprint activo en este momento."),
	SIN_BLOQUEOS("No se detectaron bloqueos ni tareas vencidas. El equipo va bien!"),
	ANALIZANDO("Analizando datos del equipo con IA... por favor espera."),
	ERROR_LLM("Error al conectar con el servicio de IA. Intenta de nuevo mas tarde.");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
