package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.KpiSnapshot;
import com.springboot.MyTodoList.service.KpiSnapshotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/kpi-snapshots")
public class KpiSnapshotController {

    private final KpiSnapshotService kpiSnapshotService;

    public KpiSnapshotController(KpiSnapshotService kpiSnapshotService) {
        this.kpiSnapshotService = kpiSnapshotService;
    }

    // GET /kpi-snapshots — obtener todos
    @GetMapping
    public List<KpiSnapshot> getAll() {
        return kpiSnapshotService.obtenerTodos();
    }

    // GET /kpi-snapshots/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<KpiSnapshot> getById(@PathVariable Long id) {
        Optional<KpiSnapshot> snapshot = kpiSnapshotService.obtenerPorId(id);
        return snapshot.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // GET /kpi-snapshots/kpi/{kpiId} — filtrar por KPI
    @GetMapping("/kpi/{kpiId}")
    public List<KpiSnapshot> getByKpi(@PathVariable Long kpiId) {
        return kpiSnapshotService.obtenerPorKpi(kpiId);
    }

    // GET /kpi-snapshots/sprint/{sprintId} — filtrar por sprint
    @GetMapping("/sprint/{sprintId}")
    public List<KpiSnapshot> getBySprint(@PathVariable Long sprintId) {
        return kpiSnapshotService.obtenerPorSprint(sprintId);
    }

    // GET /kpi-snapshots/kpi/{kpiId}/sprint/{sprintId} — filtrar por KPI y sprint
    @GetMapping("/kpi/{kpiId}/sprint/{sprintId}")
    public List<KpiSnapshot> getByKpiAndSprint(@PathVariable Long kpiId, @PathVariable Long sprintId) {
        return kpiSnapshotService.obtenerPorKpiYSprint(kpiId, sprintId);
    }

    // POST /kpi-snapshots — crear nuevo snapshot
    @PostMapping
    public ResponseEntity<KpiSnapshot> create(@RequestBody KpiSnapshot snapshot) {
        KpiSnapshot saved = kpiSnapshotService.guardar(snapshot);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /kpi-snapshots/{id} — actualizar snapshot
    @PutMapping("/{id}")
    public ResponseEntity<KpiSnapshot> update(@PathVariable Long id, @RequestBody KpiSnapshot snapshot) {
        Optional<KpiSnapshot> existing = kpiSnapshotService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        snapshot.setId(id);
        return ResponseEntity.ok(kpiSnapshotService.guardar(snapshot));
    }

    // DELETE /kpi-snapshots/{id} — eliminar snapshot
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<KpiSnapshot> existing = kpiSnapshotService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        kpiSnapshotService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
