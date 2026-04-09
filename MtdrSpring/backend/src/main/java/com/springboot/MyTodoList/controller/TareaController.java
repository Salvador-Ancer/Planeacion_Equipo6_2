package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tareas")
public class TareaController {

    private final TareaService tareaService;

    public TareaController(TareaService tareaService) {
        this.tareaService = tareaService;
    }

    // GET /tareas — obtener todas
    @GetMapping
    public List<Tarea> getAll() {
        return tareaService.obtenerTodas();
    }

    // GET /tareas/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> getById(@PathVariable Long id) {
        Optional<Tarea> tarea = tareaService.obtenerPorId(id);
        return tarea.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    // GET /tareas/estatus/{estatus} — filtrar por estatus
    @GetMapping("/estatus/{estatus}")
    public List<Tarea> getByEstatus(@PathVariable Integer estatus) {
        return tareaService.obtenerPorEstatus(estatus);
    }

    // GET /tareas/prioridad/{prioridad} — filtrar por prioridad
    @GetMapping("/prioridad/{prioridad}")
    public List<Tarea> getByPrioridad(@PathVariable String prioridad) {
        return tareaService.obtenerPorPrioridad(prioridad);
    }

    // POST /tareas — crear nueva tarea
    @PostMapping
    public ResponseEntity<Tarea> create(@RequestBody Tarea tarea) {
        Tarea saved = tareaService.guardar(tarea);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /tareas/{id} — actualizar tarea
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> update(@PathVariable Long id, @RequestBody Tarea tarea) {
        Optional<Tarea> existing = tareaService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        tarea.setId(id);
        return ResponseEntity.ok(tareaService.guardar(tarea));
    }

    // DELETE /tareas/{id} — eliminar tarea
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Tarea> existing = tareaService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        tareaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
