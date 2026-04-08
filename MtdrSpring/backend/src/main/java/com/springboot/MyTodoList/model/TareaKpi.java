package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TAREA_KPI", schema = "ADMIN")
@IdClass(TareaKpiId.class)
public class TareaKpi {

    @Id
    @Column(name = "TAREA_ID")
    private Long tareaId;

    @Id
    @Column(name = "KPI_ID")
    private Long kpiId;

    @Column(name = "PESO")
    private Double peso;

    // getters y setters
    public Long getTareaId() { return tareaId; }
    public void setTareaId(Long tareaId) { this.tareaId = tareaId; }

    public Long getKpiId() { return kpiId; }
    public void setKpiId(Long kpiId) { this.kpiId = kpiId; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
}