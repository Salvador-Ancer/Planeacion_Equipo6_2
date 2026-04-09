package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    // GET /sprints — obtener todos
    @GetMapping
    public List<Sprint> getAll() {
        return sprintService.obtenerTodos();
    }

    // GET /sprints/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getById(@PathVariable Long id) {
        Optional<Sprint> sprint = sprintService.obtenerPorId(id);
        return sprint.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // POST /sprints — crear nuevo sprint
    @PostMapping
    public ResponseEntity<Sprint> create(@RequestBody Sprint sprint) {
        Sprint saved = sprintService.guardar(sprint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /sprints/{id} — actualizar sprint
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> update(@PathVariable Long id, @RequestBody Sprint sprint) {
        Optional<Sprint> existing = sprintService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        sprint.setId(id);
        return ResponseEntity.ok(sprintService.guardar(sprint));
    }

    // DELETE /sprints/{id} — eliminar sprint
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Sprint> existing = sprintService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        sprintService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
