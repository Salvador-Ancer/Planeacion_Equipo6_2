package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Kpi;
import com.springboot.MyTodoList.repository.KpiRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KpiService {

    private final KpiRepository kpiRepository;

    public KpiService(KpiRepository kpiRepository) {
        this.kpiRepository = kpiRepository;
    }

    public Kpi guardar(Kpi kpi) {
        return kpiRepository.save(kpi);
    }

    public List<Kpi> obtenerTodos() {
        return kpiRepository.findAll();
    }

    public Optional<Kpi> obtenerPorId(Long id) {
        return kpiRepository.findById(id);
    }

    public void eliminar(Long id) {
        kpiRepository.deleteById(id);
    }
}