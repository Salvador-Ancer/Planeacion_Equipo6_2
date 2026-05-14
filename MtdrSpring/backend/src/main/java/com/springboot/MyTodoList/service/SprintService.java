package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TareaRepository  tareaRepository;

    public SprintService(SprintRepository sprintRepository, TareaRepository tareaRepository) {
        this.sprintRepository = sprintRepository;
        this.tareaRepository  = tareaRepository;
    }

    public Sprint guardar(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    public List<Sprint> obtenerTodos() {
        return sprintRepository.findAll();
    }

    public Optional<Sprint> obtenerPorId(Long id) {
        return sprintRepository.findById(id);
    }

    public List<Sprint> obtenerPorProyecto(Long proyectoId) {
        return sprintRepository.findByProyectoId(proyectoId);
    }

    public List<Sprint> obtenerPorEstatus(String estatus) {
        return sprintRepository.findByEstatusIgnoreCase(estatus);
    }

    @Transactional
    public void eliminar(Long id) {
        tareaRepository.deleteAll(tareaRepository.findBySprintId(id));
        sprintRepository.deleteById(id);
    }
}