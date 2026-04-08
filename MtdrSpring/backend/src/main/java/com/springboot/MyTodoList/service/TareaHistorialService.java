package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TareaHistorial;
import com.springboot.MyTodoList.repository.TareaHistorialRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TareaHistorialService {

    private final TareaHistorialRepository tareaHistorialRepository;

    public TareaHistorialService(TareaHistorialRepository tareaHistorialRepository) {
        this.tareaHistorialRepository = tareaHistorialRepository;
    }

    public TareaHistorial guardar(TareaHistorial historial) {
        return tareaHistorialRepository.save(historial);
    }

    public List<TareaHistorial> obtenerTodos() {
        return tareaHistorialRepository.findAll();
    }

    public Optional<TareaHistorial> obtenerPorId(Long id) {
        return tareaHistorialRepository.findById(id);
    }

    public List<TareaHistorial> obtenerPorTarea(Long tareaId) {
        return tareaHistorialRepository.findByTareaId(tareaId);
    }

    public List<TareaHistorial> obtenerPorTareaYCampo(Long tareaId, String campo) {
        return tareaHistorialRepository.findByTareaIdAndCampo(tareaId, campo);
    }

    public List<TareaHistorial> obtenerPorModificador(Long userId) {
        return tareaHistorialRepository.findByModificadoPor(userId);
    }

    public void eliminar(Long id) {
        tareaHistorialRepository.deleteById(id);
    }
}