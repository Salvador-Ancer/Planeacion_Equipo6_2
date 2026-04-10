package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "KPIS", schema = "ADMIN")
public class Kpi {

    @Id
    @Column(name = "KPI_ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "VALOR_ACTUAL")
    private Double valorActual;

    @Column(name = "VALOR_META")
    private Double valorMeta;

    @Column(name = "UNIDAD")
    private String unidad;

    @Column(name = "FECHA_MEDICION")
    private Date fechaMedicion;

    @Column(name = "PROYECTO_ID")
    private Long proyectoId;

    @Column(name = "SPRINT_ID")
    private Long sprintId;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "CREADO_EN")
    private Date creadoEn;

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

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getValorActual() { return valorActual; }
    public void setValorActual(Double valorActual) { this.valorActual = valorActual; }

    public Double getValorMeta() { return valorMeta; }
    public void setValorMeta(Double valorMeta) { this.valorMeta = valorMeta; }

    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }

    public Date getFechaMedicion() { return fechaMedicion; }
    public void setFechaMedicion(Date fechaMedicion) { this.fechaMedicion = fechaMedicion; }

    public Long getProyectoId() { return proyectoId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }

    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Date getCreadoEn() { return creadoEn; }
    public void setCreadoEn(Date creadoEn) { this.creadoEn = creadoEn; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Date getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(Date actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public Long getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(Long actualizadoPor) { this.actualizadoPor = actualizadoPor; }
}