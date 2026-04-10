package com.springboot.MyTodoList.dto;

public class AuthRequest {
    private String email;
    private String password;
    private String fullName;
    private String rol;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
