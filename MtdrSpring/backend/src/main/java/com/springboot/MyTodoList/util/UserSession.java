package com.springboot.MyTodoList.util;

public class UserSession {

    public enum State {
        NONE,
        // Agregar tarea
        ESPERANDO_NOMBRE_TAREA,
        ESPERANDO_HORAS_ESTIMADAS,
        ESPERANDO_PRIORIDAD,
        ESPERANDO_DESCRIPCION,
        ESPERANDO_FECHA_VENCIMIENTO,
        ESPERANDO_DEVELOPER,
        // Completar tarea
        ESPERANDO_ID_COMPLETAR,
        ESPERANDO_HORAS_REALES
    }

    private State state = State.NONE;
    private String nombreTarea;
    private Double horasEstimadas;
    private String prioridad;
    private String descripcion;
    private java.util.Date fechaVencimiento;
    private Long tareaIdACompletar;
    private Long developerIdAAsignar;

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public String getNombreTarea() { return nombreTarea; }
    public void setNombreTarea(String nombreTarea) { this.nombreTarea = nombreTarea; }

    public Double getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public java.util.Date getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(java.util.Date fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public Long getTareaIdACompletar() { return tareaIdACompletar; }
    public void setTareaIdACompletar(Long tareaIdACompletar) { this.tareaIdACompletar = tareaIdACompletar; }

    public Long getDeveloperIdAAsignar() { return developerIdAAsignar; }
    public void setDeveloperIdAAsignar(Long developerIdAAsignar) { this.developerIdAAsignar = developerIdAAsignar; }

    public void reset() {
        this.state = State.NONE;
        this.nombreTarea = null;
        this.horasEstimadas = null;
        this.prioridad = null;
        this.descripcion = null;
        this.fechaVencimiento = null;
        this.tareaIdACompletar = null;
        this.developerIdAAsignar = null;
    }
}
