package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "TAREA_HISTORIAL", schema = "ADMIN")
public class TareaHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HISTORIAL_ID")
    private Long id;

    @Column(name = "TAREA_ID")
    private Long tareaId;

    @Column(name = "CAMPO")
    private String campo;

    @Column(name = "VALOR_ANTERIOR")
    private String valorAnterior;

    @Column(name = "VALOR_NUEVO")
    private String valorNuevo;

    @Column(name = "MODIFICADO_POR")
    private Long modificadoPor;

    @Column(name = "MODIFICADO_EN")
    private Date modificadoEn;

    @Column(name = "ORIGEN")
    private String origen;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTareaId() { return tareaId; }
    public void setTareaId(Long tareaId) { this.tareaId = tareaId; }

    public String getCampo() { return campo; }
    public void setCampo(String campo) { this.campo = campo; }

    public String getValorAnterior() { return valorAnterior; }
    public void setValorAnterior(String valorAnterior) { this.valorAnterior = valorAnterior; }

    public String getValorNuevo() { return valorNuevo; }
    public void setValorNuevo(String valorNuevo) { this.valorNuevo = valorNuevo; }

    public Long getModificadoPor() { return modificadoPor; }
    public void setModificadoPor(Long modificadoPor) { this.modificadoPor = modificadoPor; }

    public Date getModificadoEn() { return modificadoEn; }
    public void setModificadoEn(Date modificadoEn) { this.modificadoEn = modificadoEn; }

    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }
}