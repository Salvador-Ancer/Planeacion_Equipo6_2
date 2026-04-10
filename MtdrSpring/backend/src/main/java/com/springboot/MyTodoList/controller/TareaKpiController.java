package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TareaKpi;
import com.springboot.MyTodoList.service.TareaKpiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tarea-kpi")
public class TareaKpiController {

    private final TareaKpiService tareaKpiService;

    public TareaKpiController(TareaKpiService tareaKpiService) {
        this.tareaKpiService = tareaKpiService;
    }

    // GET /tarea-kpi — obtener todos
    @GetMapping
    public List<TareaKpi> getAll() {
        return tareaKpiService.obtenerTodos();
    }

    // GET /tarea-kpi/{tareaId}/{kpiId} — obtener por clave compuesta
    @GetMapping("/{tareaId}/{kpiId}")
    public ResponseEntity<TareaKpi> getById(@PathVariable Long tareaId, @PathVariable Long kpiId) {
        Optional<TareaKpi> tareaKpi = tareaKpiService.obtenerPorId(tareaId, kpiId);
        return tareaKpi.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // GET /tarea-kpi/tarea/{tareaId} — KPIs de una tarea
    @GetMapping("/tarea/{tareaId}")
    public List<TareaKpi> getByTarea(@PathVariable Long tareaId) {
        return tareaKpiService.obtenerPorTarea(tareaId);
    }

    // GET /tarea-kpi/kpi/{kpiId} — tareas de un KPI
    @GetMapping("/kpi/{kpiId}")
    public List<TareaKpi> getByKpi(@PathVariable Long kpiId) {
        return tareaKpiService.obtenerPorKpi(kpiId);
    }

    // POST /tarea-kpi — crear relación tarea-KPI
    @PostMapping
    public ResponseEntity<TareaKpi> create(@RequestBody TareaKpi tareaKpi) {
        TareaKpi saved = tareaKpiService.guardar(tareaKpi);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // DELETE /tarea-kpi/{tareaId}/{kpiId} — eliminar relación
    @DeleteMapping("/{tareaId}/{kpiId}")
    public ResponseEntity<Void> delete(@PathVariable Long tareaId, @PathVariable Long kpiId) {
        Optional<TareaKpi> existing = tareaKpiService.obtenerPorId(tareaId, kpiId);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        tareaKpiService.eliminar(tareaId, kpiId);
        return ResponseEntity.noContent().build();
    }
}
