package com.springboot.MyTodoList.dto;

public class RagChatRequest {

    private Long proyectoId;
    private String pregunta;

    public Long getProyectoId() { return proyectoId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }

    public String getPregunta() { return pregunta; }
    public void setPregunta(String pregunta) { this.pregunta = pregunta; }
}
