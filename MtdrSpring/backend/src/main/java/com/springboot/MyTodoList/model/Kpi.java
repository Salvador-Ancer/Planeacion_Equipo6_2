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

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "VALOR_ACTUAL")
    private Double valorActual;

    @Column(name = "VALOR_META")
    private Double valorMeta;

    @Column(name = "UNIDAD")
    private String unidad;

    @Column(name = "FECHA_MEDICION")
    private Date fechaMedicion;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getValorActual() { return valorActual; }
    public void setValorActual(Double valorActual) { this.valorActual = valorActual; }

    public Double getValorMeta() { return valorMeta; }
    public void setValorMeta(Double valorMeta) { this.valorMeta = valorMeta; }

    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }

    public Date getFechaMedicion() { return fechaMedicion; }
    public void setFechaMedicion(Date fechaMedicion) { this.fechaMedicion = fechaMedicion; }
}