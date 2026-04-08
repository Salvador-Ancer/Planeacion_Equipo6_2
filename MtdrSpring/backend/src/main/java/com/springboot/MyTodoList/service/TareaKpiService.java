package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TareaKpi;
import com.springboot.MyTodoList.model.TareaKpiId;
import com.springboot.MyTodoList.repository.TareaKpiRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TareaKpiService {

    private final TareaKpiRepository tareaKpiRepository;

    public TareaKpiService(TareaKpiRepository tareaKpiRepository) {
        this.tareaKpiRepository = tareaKpiRepository;
    }

    public TareaKpi guardar(TareaKpi tareaKpi) {
        return tareaKpiRepository.save(tareaKpi);
    }

    public List<TareaKpi> obtenerTodos() {
        return tareaKpiRepository.findAll();
    }

    public Optional<TareaKpi> obtenerPorId(Long tareaId, Long kpiId) {
        return tareaKpiRepository.findById(new TareaKpiId(tareaId, kpiId));
    }

    public List<TareaKpi> obtenerPorTarea(Long tareaId) {
        return tareaKpiRepository.findByTareaId(tareaId);
    }

    public List<TareaKpi> obtenerPorKpi(Long kpiId) {
        return tareaKpiRepository.findByKpiId(kpiId);
    }

    public void eliminar(Long tareaId, Long kpiId) {
        tareaKpiRepository.deleteById(new TareaKpiId(tareaId, kpiId));
    }
}