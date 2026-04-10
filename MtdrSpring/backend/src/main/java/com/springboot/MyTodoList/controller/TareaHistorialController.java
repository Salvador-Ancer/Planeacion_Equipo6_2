package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TareaHistorial;
import com.springboot.MyTodoList.service.TareaHistorialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tarea-historial")
public class TareaHistorialController {

    private final TareaHistorialService tareaHistorialService;

    public TareaHistorialController(TareaHistorialService tareaHistorialService) {
        this.tareaHistorialService = tareaHistorialService;
    }

    // GET /tarea-historial — obtener todos
    @GetMapping
    public List<TareaHistorial> getAll() {
        return tareaHistorialService.obtenerTodos();
    }

    // GET /tarea-historial/{id} — obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<TareaHistorial> getById(@PathVariable Long id) {
        Optional<TareaHistorial> historial = tareaHistorialService.obtenerPorId(id);
        return historial.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    // GET /tarea-historial/tarea/{tareaId} — historial de una tarea
    @GetMapping("/tarea/{tareaId}")
    public List<TareaHistorial> getByTarea(@PathVariable Long tareaId) {
        return tareaHistorialService.obtenerPorTarea(tareaId);
    }

    // GET /tarea-historial/tarea/{tareaId}/campo/{campo} — historial por tarea y campo
    @GetMapping("/tarea/{tareaId}/campo/{campo}")
    public List<TareaHistorial> getByTareaAndCampo(@PathVariable Long tareaId, @PathVariable String campo) {
        return tareaHistorialService.obtenerPorTareaYCampo(tareaId, campo);
    }

    // GET /tarea-historial/modificador/{userId} — historial por usuario modificador
    @GetMapping("/modificador/{userId}")
    public List<TareaHistorial> getByModificador(@PathVariable Long userId) {
        return tareaHistorialService.obtenerPorModificador(userId);
    }

    // POST /tarea-historial — crear nuevo registro de historial
    @PostMapping
    public ResponseEntity<TareaHistorial> create(@RequestBody TareaHistorial historial) {
        TareaHistorial saved = tareaHistorialService.guardar(historial);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // DELETE /tarea-historial/{id} — eliminar registro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<TareaHistorial> existing = tareaHistorialService.obtenerPorId(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        tareaHistorialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
