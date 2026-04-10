package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "KPI_SNAPSHOTS", schema = "ADMIN")
public class KpiSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SNAPSHOT_ID")
    private Long id;

    @Column(name = "KPI_ID")
    private Long kpiId;

    @Column(name = "SPRINT_ID")
    private Long sprintId;

    @Column(name = "VALOR")
    private Double valor;

    @Column(name = "FECHA_MEDICION")
    private Date fechaMedicion;

    @Column(name = "GENERADO_POR")
    private String generadoPor;

    @Column(name = "PERIODO_INICIO")
    private Date periodoInicio;

    @Column(name = "PERIODO_FIN")
    private Date periodoFin;

    @Column(name = "NOTAS")
    private String notas;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getKpiId() { return kpiId; }
    public void setKpiId(Long kpiId) { this.kpiId = kpiId; }

    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public Date getFechaMedicion() { return fechaMedicion; }
    public void setFechaMedicion(Date fechaMedicion) { this.fechaMedicion = fechaMedicion; }

    public String getGeneradoPor() { return generadoPor; }
    public void setGeneradoPor(String generadoPor) { this.generadoPor = generadoPor; }

    public Date getPeriodoInicio() { return periodoInicio; }
    public void setPeriodoInicio(Date periodoInicio) { this.periodoInicio = periodoInicio; }

    public Date getPeriodoFin() { return periodoFin; }
    public void setPeriodoFin(Date periodoFin) { this.periodoFin = periodoFin; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}