package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.SprintRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests de SprintService usando Mockito.
 *
 * Se mockean SprintRepository y TareaRepository para que SprintService
 * funcione sin conexión a la BD de Oracle.
 */
@ExtendWith(MockitoExtension.class)
public class SprintServiceTest {

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private TareaRepository tareaRepository;

    @InjectMocks
    private SprintService sprintService;

    private Sprint sprintEjemplo;

    @BeforeEach
    void setUp() {
        sprintEjemplo = new Sprint();
        sprintEjemplo.setId(10L);
        sprintEjemplo.setNombre("Sprint 1");
        sprintEjemplo.setEstatus("Activo");
        sprintEjemplo.setProyectoId(100L);
        sprintEjemplo.setFechaInicio(new Date());
        sprintEjemplo.setFechaFin(new Date());
        sprintEjemplo.setObjetivo("Terminar el módulo de login");
    }

    // TEST 1: guardar sprint
    @Test
    void guardar_debeRetornarSprintGuardado() {
        when(sprintRepository.save(sprintEjemplo)).thenReturn(sprintEjemplo);

        Sprint resultado = sprintService.guardar(sprintEjemplo);

        assertNotNull(resultado);
        assertEquals("Sprint 1", resultado.getNombre());
        verify(sprintRepository, times(1)).save(sprintEjemplo);
    }

    // TEST 2: obtener todos los sprints
    @Test
    void obtenerTodos_debeRetornarListaDeSprints() {
        Sprint sprint2 = new Sprint();
        sprint2.setId(11L);
        sprint2.setNombre("Sprint 2");

        when(sprintRepository.findAll()).thenReturn(Arrays.asList(sprintEjemplo, sprint2));

        List<Sprint> sprints = sprintService.obtenerTodos();

        assertEquals(2, sprints.size());
        verify(sprintRepository, times(1)).findAll();
    }

    // TEST 3: buscar por ID existente
    @Test
    void obtenerPorId_cuandoExiste_debeRetornarSprint() {
        when(sprintRepository.findById(10L)).thenReturn(Optional.of(sprintEjemplo));

        Optional<Sprint> resultado = sprintService.obtenerPorId(10L);

        assertTrue(resultado.isPresent());
        assertEquals("Sprint 1", resultado.get().getNombre());
    }

    // TEST 4: buscar por ID que NO existe
    @Test
    void obtenerPorId_cuandoNoExiste_debeRetornarEmpty() {
        when(sprintRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Sprint> resultado = sprintService.obtenerPorId(999L);

        assertFalse(resultado.isPresent());
    }

    // TEST 5: buscar sprints activos 
    @Test
    void obtenerPorEstatus_debeRetornarSprintsActivos() {
        when(sprintRepository.findByEstatusIgnoreCase("Activo"))
                .thenReturn(List.of(sprintEjemplo));

        List<Sprint> activos = sprintService.obtenerPorEstatus("Activo");

        assertEquals(1, activos.size());
        assertEquals("Activo", activos.get(0).getEstatus());
        verify(sprintRepository, times(1)).findByEstatusIgnoreCase("Activo");
    }

    // TEST 6: buscar sprints por proyecto
    @Test
    void obtenerPorProyecto_debeRetornarSprintsDelProyecto() {
        when(sprintRepository.findByProyectoId(100L)).thenReturn(List.of(sprintEjemplo));

        List<Sprint> resultado = sprintService.obtenerPorProyecto(100L);

        assertEquals(1, resultado.size());
        assertEquals(100L, resultado.get(0).getProyectoId());
    }

    // TEST 7: eliminar sprint también borra sus tareas
    @Test
    void eliminar_debeBorrarTareasDelSprintYLuegoElSprint() {
        Tarea tarea = new Tarea();
        tarea.setId(1L);
        tarea.setSprintId(10L);

        when(tareaRepository.findBySprintId(10L)).thenReturn(List.of(tarea));
        doNothing().when(tareaRepository).deleteAll(anyList());
        doNothing().when(sprintRepository).deleteById(10L);

        sprintService.eliminar(10L);

        // Primero busca las tareas del sprint
        verify(tareaRepository, times(1)).findBySprintId(10L);
        // Luego las borra
        verify(tareaRepository, times(1)).deleteAll(anyList());
        // Finalmente borra el sprint
        verify(sprintRepository, times(1)).deleteById(10L);
    }

    // TEST 8: eliminar sprint sin tareas
    @Test
    void eliminar_sprintSinTareas_soloBorraElSprint() {
        when(tareaRepository.findBySprintId(10L)).thenReturn(List.of());
        doNothing().when(tareaRepository).deleteAll(anyList());
        doNothing().when(sprintRepository).deleteById(10L);

        sprintService.eliminar(10L);

        verify(sprintRepository, times(1)).deleteById(10L);
    }
}
