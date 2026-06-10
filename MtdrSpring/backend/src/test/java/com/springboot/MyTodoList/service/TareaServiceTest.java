package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TareaServiceTest {

    @Mock
    private TareaRepository tareaRepository;

    @InjectMocks
    private TareaService tareaService;

    private Tarea tareaEjemplo;

    @BeforeEach
    void setUp() {
        tareaEjemplo = new Tarea();
        tareaEjemplo.setId(1L);
        tareaEjemplo.setNombre("Implementar login");
        tareaEjemplo.setEstatus("Pendiente");
        tareaEjemplo.setPrioridad("Alta");
        tareaEjemplo.setSprintId(10L);
        tareaEjemplo.setProyectoId(100L);
        tareaEjemplo.setAsignadoA(5L);
        tareaEjemplo.setBorrado(0);
        tareaEjemplo.setFechaCreacion(new Date());
    }

    // [Happy path] Verify guardar delegates to repository and returns saved
    @Test
    void guardar_validTarea_returnsSaved() {
        when(tareaRepository.save(tareaEjemplo)).thenReturn(tareaEjemplo);

        Tarea resultado = tareaService.guardar(tareaEjemplo);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getNombre()).isEqualTo("Implementar login");
        verify(tareaRepository, times(1)).save(tareaEjemplo);
    }

    // [Happy path] Verify obtenerTodas returns list
    @Test
    void obtenerTodas_always_returnsList() {
        Tarea tarea2 = new Tarea();
        tarea2.setId(2L);
        tarea2.setNombre("Diseñar UI");

        when(tareaRepository.findAll()).thenReturn(Arrays.asList(tareaEjemplo, tarea2));

        List<Tarea> tareas = tareaService.obtenerTodas();

        assertThat(tareas).hasSize(2);
        verify(tareaRepository, times(1)).findAll();
    }

    // [Found] Verify obtenerPorId returns Optional present
    @Test
    void obtenerPorId_existingId_returnsOptionalPresent() {
        when(tareaRepository.findById(1L)).thenReturn(Optional.of(tareaEjemplo));

        Optional<Tarea> resultado = tareaService.obtenerPorId(1L);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getId()).isEqualTo(1L);
        verify(tareaRepository, times(1)).findById(1L);
    }

    // [Not found] Verify obtenerPorId returns Optional empty
    @Test
    void obtenerPorId_nonExistingId_returnsOptionalEmpty() {
        when(tareaRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Tarea> resultado = tareaService.obtenerPorId(999L);

        assertThat(resultado).isEmpty();
        verify(tareaRepository, times(1)).findById(999L);
    }

    // [Happy path] Verify obtenerPorEstatus delegates
    @Test
    void obtenerPorEstatus_matchingStatus_returnsFilteredList() {
        when(tareaRepository.findByEstatus("Pendiente")).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorEstatus("Pendiente");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getEstatus()).isEqualTo("Pendiente");
        verify(tareaRepository, times(1)).findByEstatus("Pendiente");
    }

    // [Happy path] Verify obtenerPorPrioridad delegates
    @Test
    void obtenerPorPrioridad_matchingPriority_returnsFilteredList() {
        when(tareaRepository.findByPrioridad("Alta")).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorPrioridad("Alta");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getPrioridad()).isEqualTo("Alta");
        verify(tareaRepository, times(1)).findByPrioridad("Alta");
    }

    // [Happy path] Verify obtenerPorSprint delegates
    @Test
    void obtenerPorSprint_existingSprint_returnsFilteredList() {
        when(tareaRepository.findBySprintId(10L)).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorSprint(10L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getSprintId()).isEqualTo(10L);
        verify(tareaRepository, times(1)).findBySprintId(10L);
    }

    // [Happy path] Verify obtenerPorProyecto delegates
    @Test
    void obtenerPorProyecto_existingProyecto_returnsFilteredList() {
        when(tareaRepository.findByProyectoId(100L)).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorProyecto(100L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getProyectoId()).isEqualTo(100L);
        verify(tareaRepository, times(1)).findByProyectoId(100L);
    }

    // [Happy path] Verify obtenerPorAsignado delegates
    @Test
    void obtenerPorAsignado_existingUser_returnsFilteredList() {
        when(tareaRepository.findByAsignadoA(5L)).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorAsignado(5L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getAsignadoA()).isEqualTo(5L);
        verify(tareaRepository, times(1)).findByAsignadoA(5L);
    }

    // [Happy path] Verify obtenerActivas delegates
    @Test
    void obtenerActivas_always_returnsNonDeletedList() {
        when(tareaRepository.findActivas()).thenReturn(List.of(tareaEjemplo));

        List<Tarea> activas = tareaService.obtenerActivas();

        assertThat(activas).isNotEmpty();
        assertThat(activas).allSatisfy(t -> assertThat(t.getBorrado()).isNotEqualTo(1));
        verify(tareaRepository, times(1)).findActivas();
    }

    // [Happy path] Verify eliminar delegates to deleteById
    @Test
    void eliminar_existingId_delegatesToRepository() {
        doNothing().when(tareaRepository).deleteById(1L);

        tareaService.eliminar(1L);

        verify(tareaRepository, times(1)).deleteById(1L);
    }
}
