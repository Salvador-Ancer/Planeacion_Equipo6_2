package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "CREDENCIALES", schema = "ADMIN")
public class Credencial {

    @Id
    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "OAUTH_ID")
    private Long oauthId;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "ACTIVO")
    private Integer activo;

    // getters y setters
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getOauthId() { return oauthId; }
    public void setOauthId(Long oauthId) { this.oauthId = oauthId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Integer getActivo() { return activo; }
    public void setActivo(Integer activo) { this.activo = activo; }
}