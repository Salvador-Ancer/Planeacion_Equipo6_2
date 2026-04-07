package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SPRINTS", schema = "ADMIN")
public class Sprint {

    @Id
    @Column(name = "SPRINT_ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "FECHA_INICIO")
    private Date fechaInicio;

    @Column(name = "FECHA_FIN")
    private Date fechaFin;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "OBJETIVO")
    private String objetivo;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Date getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(Date fechaInicio) { this.fechaInicio = fechaInicio; }

    public Date getFechaFin() { return fechaFin; }
    public void setFechaFin(Date fechaFin) { this.fechaFin = fechaFin; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
}