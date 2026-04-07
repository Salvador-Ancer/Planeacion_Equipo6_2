package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test-jpa")
public class TestJpaController {

    private final UsuarioService UsuarioService;

    public TestJpaController(UsuarioService UsuarioService) {
        this.UsuarioService = UsuarioService;
    }

    // CREAR usuario
    @PostMapping("/crear-usuario")
    public String crearUsuario() {
        Usuario Usuario = new Usuario();
        Usuario.setId(100L);
        Usuario.setFullName("Silvanna Farias");
        Usuario.setEmail("silvanna@oracle.com");
        Usuario.setRol("Developer");
        Usuario.setTelegramId(123456L);

        UsuarioService.guardar(Usuario);
        return "Usuario guardado correctamente";
    }

    // LISTAR usuarios
    @GetMapping("/listar-usuarios")
    public List<Usuario> listarUsuarios() {
        return UsuarioService.obtenerTodos();
    }
}