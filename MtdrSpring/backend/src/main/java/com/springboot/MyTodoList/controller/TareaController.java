package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tareas")
public class TareaController {

    private final TareaService tareaService;
    private final UsuarioService usuarioService;

    public TareaController(TareaService tareaService, UsuarioService usuarioService) {
        this.tareaService = tareaService;
        this.usuarioService = usuarioService;
    }

    // GET /tareas
    @GetMapping
    public List<Tarea> getAll() {
        return tareaService.obtenerTodas();
    }

    // GET /tareas/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> getById(@PathVariable Long id) {
        Optional<Tarea> tarea = tareaService.obtenerPorId(id);
        return tarea.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    // GET /tareas/estatus/{estatus}
    @GetMapping("/estatus/{estatus}")
    public List<Tarea> getByEstatus(@PathVariable String estatus) {
        return tareaService.obtenerPorEstatus(estatus);
    }

    // GET /tareas/prioridad/{prioridad}
    @GetMapping("/prioridad/{prioridad}")
    public List<Tarea> getByPrioridad(@PathVariable String prioridad) {
        return tareaService.obtenerPorPrioridad(prioridad);
    }

    // GET /tareas/asignado/{userId}
    @GetMapping("/asignado/{userId}")
    public List<Tarea> getByAsignado(@PathVariable Long userId) {
        return tareaService.obtenerPorAsignado(userId);
    }

    // GET /tareas/sprint/{sprintId}
    @GetMapping("/sprint/{sprintId}")
    public List<Tarea> getBySprint(@PathVariable Long sprintId) {
        return tareaService.obtenerPorSprint(sprintId);
    }

    // GET /tareas/proyecto/{proyectoId}
    @GetMapping("/proyecto/{proyectoId}")
    public List<Tarea> getByProyecto(@PathVariable Long proyectoId) {
        return tareaService.obtenerPorProyecto(proyectoId);
    }

    // POST /tareas
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tarea tarea) {
        if (tarea.getNombre() == null || tarea.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body("El campo 'nombre' es obligatorio");
        }
        if (tarea.getId() == null) {
            tarea.setId(System.currentTimeMillis());
        }
        if (tarea.getBorrado() == null) {
            tarea.setBorrado(0);
        }
        if (tarea.getFechaCreacion() == null) {
            tarea.setFechaCreacion(new java.util.Date());
        }
        Tarea saved = tareaService.guardar(tarea);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /tareas/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> update(@PathVariable Long id, @RequestBody Tarea tarea) {
        Optional<Tarea> existing = tareaService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Tarea existente = existing.get();
        tarea.setId(id);
        tarea.setActualizadoEn(new java.util.Date());
        if (tarea.getBorrado() == null) tarea.setBorrado(existente.getBorrado());
        if (tarea.getFechaCreacion() == null) tarea.setFechaCreacion(existente.getFechaCreacion());
        if (tarea.getAsignadoA() != null && usuarioService.obtenerPorId(tarea.getAsignadoA()).isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(tareaService.guardar(tarea));
    }

    // DELETE /tareas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Tarea> existing = tareaService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        tareaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
