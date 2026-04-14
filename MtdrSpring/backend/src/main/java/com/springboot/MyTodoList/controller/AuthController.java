package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.AuthRequest;
import com.springboot.MyTodoList.dto.AuthResponse;
import com.springboot.MyTodoList.model.Credencial;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.CredencialService;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final CredencialService credencialService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UsuarioService usuarioService, CredencialService credencialService) {
        this.usuarioService = usuarioService;
        this.credencialService = credencialService;
    }

    // POST /auth/register — crear cuenta nueva
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {

        // Verificar si el email ya existe
        Credencial existing = credencialService.obtenerPorEmail(request.getEmail());
        if (existing != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse("El email ya está registrado", false));
        }

        // Crear usuario
        Usuario usuario = new Usuario();
        usuario.setId(System.currentTimeMillis());
        usuario.setFullName(request.getFullName());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol() != null ? request.getRol() : "Developer");
        Usuario savedUsuario = usuarioService.guardar(usuario);
        System.out.println(">>> Usuario guardado con ID: " + savedUsuario.getId()); 

        // Crear credencial con password hasheado
        Credencial credencial = new Credencial();
        credencial.setEmail(request.getEmail());
        credencial.setHashPassword(passwordEncoder.encode(request.getPassword()));
        credencial.setUserId(savedUsuario.getId());
        credencial.setFechaCreacion(new Date());
        credencial.setActivo(1);
        credencialService.guardar(credencial);
        System.out.println(">>> Credencial guardada con USER_ID: " + credencial.getUserId());


        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse("Usuario registrado exitosamente", true,
                        savedUsuario.getId(), savedUsuario.getEmail(), savedUsuario.getRol()));
    }

    // POST /auth/login — iniciar sesión
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {

        // Buscar credencial por email
        Credencial credencial = credencialService.obtenerPorEmail(request.getEmail());
        if (credencial == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Email o password incorrectos", false));
        }

        // Verificar que la cuenta esté activa
        if (credencial.getActivo() == null || credencial.getActivo() != 1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Cuenta inactiva", false));
        }

        // Verificar password
        if (!passwordEncoder.matches(request.getPassword(), credencial.getHashPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Email o password incorrectos", false));
        }

        // Actualizar ultimo login
        credencial.setUltimoLogin(new Date());
        credencialService.guardar(credencial);

        // Obtener datos del usuario
        Optional<Usuario> usuario = usuarioService.obtenerPorId(credencial.getUserId());
        String rol = usuario.map(Usuario::getRol).orElse("Developer");

        return ResponseEntity.ok(new AuthResponse("Login exitoso", true,
                credencial.getUserId(), credencial.getEmail(), rol));
    }
}
