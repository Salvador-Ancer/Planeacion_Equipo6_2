package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Kpi;
import com.springboot.MyTodoList.service.KpiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/kpis")
public class KpiController {

    private final KpiService kpiService;

    public KpiController(KpiService kpiService) {
        this.kpiService = kpiService;
    }

    // GET /kpis — obtener todos
    @GetMapping
    public List<Kpi> getAll() {
        return kpiService.obtenerTodos();
    }

    // GET /kpis/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Kpi> getById(@PathVariable Long id) {
        Optional<Kpi> kpi = kpiService.obtenerPorId(id);
        return kpi.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // GET /kpis/proyecto/{proyectoId} — filtrar por proyecto
    @GetMapping("/proyecto/{proyectoId}")
    public List<Kpi> getByProyecto(@PathVariable Long proyectoId) {
        return kpiService.obtenerPorProyecto(proyectoId);
    }

    // GET /kpis/sprint/{sprintId} — filtrar por sprint
    @GetMapping("/sprint/{sprintId}")
    public List<Kpi> getBySprint(@PathVariable Long sprintId) {
        return kpiService.obtenerPorSprint(sprintId);
    }

    // GET /kpis/usuario/{userId} — filtrar por usuario
    @GetMapping("/usuario/{userId}")
    public List<Kpi> getByUsuario(@PathVariable Long userId) {
        return kpiService.obtenerPorUsuario(userId);
    }

    // POST /kpis — crear nuevo KPI
    @PostMapping
    public ResponseEntity<Kpi> create(@RequestBody Kpi kpi) {
        Kpi saved = kpiService.guardar(kpi);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /kpis/{id} — actualizar KPI
    @PutMapping("/{id}")
    public ResponseEntity<Kpi> update(@PathVariable Long id, @RequestBody Kpi kpi) {
        Optional<Kpi> existing = kpiService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        kpi.setId(id);
        return ResponseEntity.ok(kpiService.guardar(kpi));
    }

    // DELETE /kpis/{id} — eliminar KPI
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Kpi> existing = kpiService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        kpiService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
