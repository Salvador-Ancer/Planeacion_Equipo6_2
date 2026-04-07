package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "PROYECTOS", schema = "ADMIN")
public class Proyecto {

    @Id
    @Column(name = "PROYECTO_ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "FECHA_INICIO")
    private Date fechaInicio;

    @Column(name = "FECHA_FIN")
    private Date fechaFin;

    @Column(name = "ESTATUS")
    private Integer estatus;

    @Column(name = "DESCRIPTION")
    private String description;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Date getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(Date fechaInicio) { this.fechaInicio = fechaInicio; }

    public Date getFechaFin() { return fechaFin; }
    public void setFechaFin(Date fechaFin) { this.fechaFin = fechaFin; }

    public Integer getEstatus() { return estatus; }
    public void setEstatus(Integer estatus) { this.estatus = estatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}