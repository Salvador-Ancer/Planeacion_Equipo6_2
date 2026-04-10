package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // GET /usuarios — obtener todos
    @GetMapping
    public List<Usuario> getAll() {
        return usuarioService.obtenerTodos();
    }

    // GET /usuarios/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerPorId(id);
        return usuario.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // POST /usuarios — crear nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> create(@RequestBody Usuario usuario) {
        Usuario saved = usuarioService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /usuarios/{id} — actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Long id, @RequestBody Usuario usuario) {
        Optional<Usuario> existing = usuarioService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        usuario.setId(id);
        return ResponseEntity.ok(usuarioService.guardar(usuario));
    }

    // DELETE /usuarios/{id} — eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Usuario> existing = usuarioService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
