package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProyectoService {

    private final ProyectoRepository proyectoRepository;
    private final EmbeddingSyncService embeddingSyncService;

    public ProyectoService(ProyectoRepository proyectoRepository, EmbeddingSyncService embeddingSyncService) {
        this.proyectoRepository = proyectoRepository;
        this.embeddingSyncService = embeddingSyncService;
    }

    public Proyecto guardar(Proyecto proyecto) {
        Proyecto guardado = proyectoRepository.save(proyecto);
        embeddingSyncService.syncProyecto(guardado.getId());
        return guardado;
    }

    public List<Proyecto> obtenerTodos() {
        return proyectoRepository.findAll();
    }

    public Optional<Proyecto> obtenerPorId(Long id) {
        return proyectoRepository.findById(id);
    }

    public List<Proyecto> obtenerPorEstatus(String estatus) {
        return proyectoRepository.findByEstatus(estatus);
    }

    public void eliminar(Long id) {
        proyectoRepository.deleteById(id);
    }
}