package com.springboot.MyTodoList.util;

public enum BotLabels {

	SHOW_MAIN_SCREEN("Show Main Screen"),
	HIDE_MAIN_SCREEN("Hide Main Screen"),
	LIST_ALL_ITEMS("List All Items"),
	ADD_NEW_ITEM("Add New Item"),
	DONE("DONE"),
	UNDO("UNDO"),
	DELETE("DELETE"),
	MY_TODO_LIST("MY TODO LIST"),
	DASH("-"),
	MIS_TAREAS("Mis Tareas"),
	KPI_SPRINT("KPIs del Sprint"),
	SPRINT_ACTIVO("Sprint Activo"),
	BLOQUEOS("Bloqueos"),
	RENDIMIENTO_EQUIPO("Rendimiento del Equipo"),
	ANALIZAR_IA("Analizar con IA");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
