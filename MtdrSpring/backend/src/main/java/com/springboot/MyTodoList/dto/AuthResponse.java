package com.springboot.MyTodoList.dto;

public class AuthResponse {
    private String mensaje;
    private boolean exito;
    private Long userId;
    private String email;
    private String rol;

    public AuthResponse(String mensaje, boolean exito) {
        this.mensaje = mensaje;
        this.exito = exito;
    }

    public AuthResponse(String mensaje, boolean exito, Long userId, String email, String rol) {
        this.mensaje = mensaje;
        this.exito = exito;
        this.userId = userId;
        this.email = email;
        this.rol = rol;
    }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
