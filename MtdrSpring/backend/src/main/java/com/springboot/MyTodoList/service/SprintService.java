package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
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

    public void eliminar(Long id) {
        sprintRepository.deleteById(id);
    }
}