package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Kpi;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.KpiRepository;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class KpiCalculatorService {

    private final TareaRepository tareaRepository;
    private final KpiRepository   kpiRepository;

    public KpiCalculatorService(TareaRepository tareaRepository, KpiRepository kpiRepository) {
        this.tareaRepository = tareaRepository;
        this.kpiRepository   = kpiRepository;
    }

    // Recalcula KPIs de un sprint y los guarda en ADMIN.KPIS
    public void recalcularPorSprint(Long sprintId, Long proyectoId) {
        List<Tarea> tareas = tareaRepository.findBySprintId(sprintId);

        long   total          = tareas.size();
        long   completadas    = tareas.stream().filter(t -> "Completado".equals(t.getEstatus())).count();
        double spCompletados  = tareas.stream()
                .filter(t -> "Completado".equals(t.getEstatus()))
                .mapToDouble(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();
        double horasReales    = tareas.stream()
                .mapToDouble(t -> t.getHorasReales() != null ? t.getHorasReales() : 0)
                .sum();
        double tasa           = total > 0 ? Math.round((completadas * 100.0) / total * 10.0) / 10.0 : 0;

        upsertSprintKpi("Tareas Completadas",        "tareas", completadas,   sprintId, proyectoId);
        upsertSprintKpi("Story Points Completados",  "SP",     spCompletados, sprintId, proyectoId);
        upsertSprintKpi("Tasa de Completitud",       "%",      tasa,          sprintId, proyectoId);
        upsertSprintKpi("Horas Reales Registradas",  "h",      horasReales,   sprintId, proyectoId);
    }

    // Recalcula KPI de avance global del proyecto
    public void recalcularPorProyecto(Long proyectoId) {
        List<Tarea> tareas     = tareaRepository.findByProyectoId(proyectoId);
        long        total      = tareas.size();
        long        completadas = tareas.stream().filter(t -> "Completado".equals(t.getEstatus())).count();
        double      avance     = total > 0 ? Math.round((completadas * 100.0) / total * 10.0) / 10.0 : 0;

        upsertProyectoKpi("Avance del Proyecto", "%", avance, proyectoId);
    }

    private void upsertSprintKpi(String nombre, String unidad, double valor, Long sprintId, Long proyectoId) {
        Optional<Kpi> existing = kpiRepository.findByNombreAndSprintId(nombre, sprintId);
        Kpi kpi = existing.orElseGet(() -> {
            Kpi k = new Kpi();
            k.setId(Math.abs(System.currentTimeMillis() % 1_000_000_000L + Math.abs(nombre.hashCode() % 100_000L)));
            k.setNombre(nombre);
            k.setUnidad(unidad);
            k.setSprintId(sprintId);
            k.setProyectoId(proyectoId);
            k.setCreadoEn(new Date());
            return k;
        });
        kpi.setValorActual(valor);
        kpi.setActualizadoEn(new Date());
        kpi.setFechaMedicion(new Date());
        kpiRepository.save(kpi);
    }

    private void upsertProyectoKpi(String nombre, String unidad, double valor, Long proyectoId) {
        Optional<Kpi> existing = kpiRepository.findByNombreAndProyectoIdAndSprintIdIsNull(nombre, proyectoId);
        Kpi kpi = existing.orElseGet(() -> {
            Kpi k = new Kpi();
            k.setId(Math.abs(System.currentTimeMillis() % 1_000_000_000L + Math.abs(nombre.hashCode() % 100_000L) + proyectoId));
            k.setNombre(nombre);
            k.setUnidad(unidad);
            k.setProyectoId(proyectoId);
            k.setCreadoEn(new Date());
            return k;
        });
        kpi.setValorActual(valor);
        kpi.setActualizadoEn(new Date());
        kpi.setFechaMedicion(new Date());
        kpiRepository.save(kpi);
    }
}
