package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "CREDENCIALES", schema = "ADMIN")
public class Credencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CREDENCIAL_ID")
    private Long id;

    @Column(name = "HASH_PASSWORD")
    private String hashPassword;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "ACTIVO")
    private Integer activo;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "OAUTH_TOKEN")
    private String oauthToken;

    @Column(name = "REFRESH_TOKEN")
    private String refreshToken;

    @Column(name = "TOKEN_EXPIRY")
    private Date tokenExpiry;

    @Column(name = "ULTIMO_LOGIN")
    private Date ultimoLogin;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHashPassword() { return hashPassword; }
    public void setHashPassword(String hashPassword) { this.hashPassword = hashPassword; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Integer getActivo() { return activo; }
    public void setActivo(Integer activo) { this.activo = activo; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getOauthToken() { return oauthToken; }
    public void setOauthToken(String oauthToken) { this.oauthToken = oauthToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Date getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(Date tokenExpiry) { this.tokenExpiry = tokenExpiry; }

    public Date getUltimoLogin() { return ultimoLogin; }
    public void setUltimoLogin(Date ultimoLogin) { this.ultimoLogin = ultimoLogin; }
}