package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.service.ProyectoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/proyectos")
public class ProyectoController {

    private final ProyectoService proyectoService;

    public ProyectoController(ProyectoService proyectoService) {
        this.proyectoService = proyectoService;
    }

    // GET /proyectos — obtener todos
    @GetMapping
    public List<Proyecto> getAll() {
        return proyectoService.obtenerTodos();
    }

    // GET /proyectos/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> getById(@PathVariable Long id) {
        Optional<Proyecto> proyecto = proyectoService.obtenerPorId(id);
        return proyecto.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // POST /proyectos — crear nuevo proyecto
    @PostMapping
    public ResponseEntity<Proyecto> create(@RequestBody Proyecto proyecto) {
        if (proyecto.getId() == null) {
            proyecto.setId(System.currentTimeMillis());
        }
        Proyecto saved = proyectoService.guardar(proyecto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /proyectos/{id} — actualizar proyecto
    @PutMapping("/{id}")
    public ResponseEntity<Proyecto> update(@PathVariable Long id, @RequestBody Proyecto proyecto) {
        Optional<Proyecto> existing = proyectoService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        proyecto.setId(id);
        return ResponseEntity.ok(proyectoService.guardar(proyecto));
    }

    // DELETE /proyectos/{id} — eliminar proyecto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Proyecto> existing = proyectoService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        proyectoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
