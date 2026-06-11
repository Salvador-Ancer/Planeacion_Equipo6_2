package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    private final TareaRepository tareaRepository;
    private final EmbeddingSyncService embeddingSyncService;

    public TareaService(TareaRepository tareaRepository, EmbeddingSyncService embeddingSyncService) {
        this.tareaRepository = tareaRepository;
        this.embeddingSyncService = embeddingSyncService;
    }

    public Tarea guardar(Tarea tarea) {
        Tarea guardada = tareaRepository.save(tarea);
        embeddingSyncService.syncTarea(guardada.getId());
        return guardada;
    }

    public List<Tarea> obtenerTodas() {
        return tareaRepository.findAll();
    }

    public Optional<Tarea> obtenerPorId(Long id) {
        return tareaRepository.findById(id);
    }

    public List<Tarea> obtenerPorEstatus(String estatus) {
        return tareaRepository.findByEstatus(estatus);
    }

    public List<Tarea> obtenerPorPrioridad(String prioridad) {
        return tareaRepository.findByPrioridad(prioridad);
    }

    public List<Tarea> obtenerPorSprint(Long sprintId) {
        return tareaRepository.findBySprintId(sprintId);
    }

    public List<Tarea> obtenerPorProyecto(Long proyectoId) {
        return tareaRepository.findByProyectoId(proyectoId);
    }

    public List<Tarea> obtenerPorAsignado(Long userId) {
        return tareaRepository.findByAsignadoA(userId);
    }

    public List<Tarea> obtenerActivas() {
        return tareaRepository.findActivas();
    }

    public void eliminar(Long id) {
        tareaRepository.deleteById(id);
    }
}