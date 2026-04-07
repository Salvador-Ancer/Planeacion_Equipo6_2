package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProyectoService {

    private final ProyectoRepository proyectoRepository;

    public ProyectoService(ProyectoRepository proyectoRepository) {
        this.proyectoRepository = proyectoRepository;
    }

    public Proyecto guardar(Proyecto proyecto) {
        return proyectoRepository.save(proyecto);
    }

    public List<Proyecto> obtenerTodos() {
        return proyectoRepository.findAll();
    }

    public Optional<Proyecto> obtenerPorId(Long id) {
        return proyectoRepository.findById(id);
    }

    public void eliminar(Long id) {
        proyectoRepository.deleteById(id);
    }
}