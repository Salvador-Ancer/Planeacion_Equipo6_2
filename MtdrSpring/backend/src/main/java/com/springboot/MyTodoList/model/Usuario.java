package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "USUARIOS", schema = "ADMIN")
public class Usuario {

    @Id
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "ROL")
    private String rol;

    @Column(name = "TELEGRAM_ID")
    private Long telegramId;

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Long getTelegramId() { return telegramId; }
    public void setTelegramId(Long telegramId) { this.telegramId = telegramId; }
}