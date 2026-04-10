package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.KpiSnapshot;
import com.springboot.MyTodoList.repository.KpiSnapshotRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class KpiSnapshotService {

    private final KpiSnapshotRepository kpiSnapshotRepository;

    public KpiSnapshotService(KpiSnapshotRepository kpiSnapshotRepository) {
        this.kpiSnapshotRepository = kpiSnapshotRepository;
    }

    public KpiSnapshot guardar(KpiSnapshot snapshot) {
        return kpiSnapshotRepository.save(snapshot);
    }

    public List<KpiSnapshot> obtenerTodos() {
        return kpiSnapshotRepository.findAll();
    }

    public Optional<KpiSnapshot> obtenerPorId(Long id) {
        return kpiSnapshotRepository.findById(id);
    }

    public List<KpiSnapshot> obtenerPorKpi(Long kpiId) {
        return kpiSnapshotRepository.findByKpiId(kpiId);
    }

    public List<KpiSnapshot> obtenerPorSprint(Long sprintId) {
        return kpiSnapshotRepository.findBySprintId(sprintId);
    }

    public List<KpiSnapshot> obtenerPorKpiYSprint(Long kpiId, Long sprintId) {
        return kpiSnapshotRepository.findByKpiIdAndSprintId(kpiId, sprintId);
    }

    public void eliminar(Long id) {
        kpiSnapshotRepository.deleteById(id);
    }
}