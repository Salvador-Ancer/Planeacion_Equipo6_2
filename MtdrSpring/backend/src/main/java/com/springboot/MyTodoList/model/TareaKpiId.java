package com.springboot.MyTodoList.model;

import java.io.Serializable;
import java.util.Objects;

public class TareaKpiId implements Serializable {

    private Long tareaId;
    private Long kpiId;

    public TareaKpiId() {
    }

    public TareaKpiId(Long tareaId, Long kpiId) {
        this.tareaId = tareaId;
        this.kpiId = kpiId;
    }

    public Long getTareaId() {
        return tareaId;
    }

    public void setTareaId(Long tareaId) {
        this.tareaId = tareaId;
    }

    public Long getKpiId() {
        return kpiId;
    }

    public void setKpiId(Long kpiId) {
        this.kpiId = kpiId;
    }

    @Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof TareaKpiId)) return false;
    TareaKpiId that = (TareaKpiId) o;
    return Objects.equals(tareaId, that.tareaId) &&
           Objects.equals(kpiId, that.kpiId);
}

    @Override
    public int hashCode() {
        return Objects.hash(tareaId, kpiId);
    }
}