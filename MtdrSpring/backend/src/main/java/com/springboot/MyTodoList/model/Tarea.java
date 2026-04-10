package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "TAREAS", schema = "ADMIN")
public class Tarea {

    @Id
    @Column(name = "TAREA_ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "PRIORIDAD")
    private String prioridad;

    @Column(name = "ESTATUS")
    private String estatus;

    @Column(name = "FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "FECHA_VENCIMIENTO")
    private Date fechaVencimiento;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "HORAS_ESTIMADAS")
    private Double horasEstimadas;

    @Column(name = "HORAS_REALES")
    private Double horasReales;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @Column(name = "BORRADO")
    private Integer borrado;

    @Column(name = "BORRADO_POR")
    private Long borradoPor;

    @Column(name = "SPRINT_ID")
    private Long sprintId;

    @Column(name = "PROYECTO_ID")
    private Long proyectoId;

    @Column(name = "ASIGNADO_A")
    private Long asignadoA;

    @Column(name = "CREADO_POR")
    private Long creadoPor;

    @Column(name = "ACTUALIZADO_EN")
    private Date actualizadoEn;

    @Column(name = "ACTUALIZADO_POR")
    private Long actualizadoPor;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getEstatus() { return estatus; }
    public void setEstatus(String estatus) { this.estatus = estatus; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Date getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(Date fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }

    public Double getHorasReales() { return horasReales; }
    public void setHorasReales(Double horasReales) { this.horasReales = horasReales; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getBorrado() { return borrado; }
    public void setBorrado(Integer borrado) { this.borrado = borrado; }

    public Long getBorradoPor() { return borradoPor; }
    public void setBorradoPor(Long borradoPor) { this.borradoPor = borradoPor; }

    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }

    public Long getProyectoId() { return proyectoId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }

    public Long getAsignadoA() { return asignadoA; }
    public void setAsignadoA(Long asignadoA) { this.asignadoA = asignadoA; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Date getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(Date actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public Long getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(Long actualizadoPor) { this.actualizadoPor = actualizadoPor; }
}