package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Credencial;
import com.springboot.MyTodoList.service.CredencialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/credenciales")
public class CredencialController {

    private final CredencialService credencialService;

    public CredencialController(CredencialService credencialService) {
        this.credencialService = credencialService;
    }

    // GET /credenciales — obtener todas
    @GetMapping
    public List<Credencial> getAll() {
        return credencialService.obtenerTodas();
    }

    // GET /credenciales/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Credencial> getById(@PathVariable Long id) {
        Optional<Credencial> credencial = credencialService.obtenerPorId(id);
        return credencial.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // GET /credenciales/usuario/{userId} — obtener por usuario
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<Credencial> getByUsuario(@PathVariable Long userId) {
        Optional<Credencial> credencial = credencialService.obtenerPorUsuario(userId);
        return credencial.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // POST /credenciales — crear nueva credencial
    @PostMapping
    public ResponseEntity<Credencial> create(@RequestBody Credencial credencial) {
        Credencial saved = credencialService.guardar(credencial);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /credenciales/{id} — actualizar credencial
    @PutMapping("/{id}")
    public ResponseEntity<Credencial> update(@PathVariable Long id, @RequestBody Credencial credencial) {
        Optional<Credencial> existing = credencialService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        credencial.setId(id);
        return ResponseEntity.ok(credencialService.guardar(credencial));
    }

    // DELETE /credenciales/{id} — eliminar credencial
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Credencial> existing = credencialService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        credencialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
