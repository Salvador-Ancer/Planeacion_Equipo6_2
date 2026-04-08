package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    private final TareaRepository tareaRepository;

    public TareaService(TareaRepository tareaRepository) {
        this.tareaRepository = tareaRepository;
    }

    public Tarea guardar(Tarea tarea) {
        return tareaRepository.save(tarea);
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
        return tareaRepository.findByBorrado(0);
    }

    public void eliminar(Long id) {
        tareaRepository.deleteById(id);
    }
}