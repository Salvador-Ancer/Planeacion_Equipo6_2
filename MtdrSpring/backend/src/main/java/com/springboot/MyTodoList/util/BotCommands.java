package com.springboot.MyTodoList.util;

public enum BotCommands {

	START_COMMAND("/start"),
	HIDE_COMMAND("/hide"),
	TODO_LIST("/todolist"),
	ADD_ITEM("/additem"),
	LLM_REQ("/llm"),
	MIS_TAREAS("/mistareas"),
	KPI_SPRINT("/kpis"),
	SPRINT_ACTIVO("/sprint"),
	BLOQUEOS("/bloqueos"),
	RENDIMIENTO("/rendimiento"),
	ANALIZAR("/analizar"),
	ADD_TAREA("/addtarea"),
	ASIGNAR_SPRINT("/asignarsprint"),
	COMPLETAR_TAREA("/completartarea");

	private String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
