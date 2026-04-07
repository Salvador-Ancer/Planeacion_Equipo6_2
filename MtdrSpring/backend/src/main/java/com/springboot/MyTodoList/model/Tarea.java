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
    private Integer estatus;

    @Column(name = "FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "FECHA_VENCIMIENTO")
    private Date fechaVencimiento;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "HORAS_ESTIMADAS")
    private Double horasEstimadas;

    @Column(name = "HORAS_REALES")
    private Double horasReales;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @Column(name = "DELETED")
    private Integer deleted;

    @Column(name = "DELETED_BY")
    private String deletedBy;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public Integer getEstatus() { return estatus; }
    public void setEstatus(Integer estatus) { this.estatus = estatus; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Date getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(Date fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }

    public Double getHorasReales() { return horasReales; }
    public void setHorasReales(Double horasReales) { this.horasReales = horasReales; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }

    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }
}