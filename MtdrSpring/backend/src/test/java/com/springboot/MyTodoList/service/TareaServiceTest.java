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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests de TareaService usando Mockito.
 *
 * Patrón: el repositorio es un @Mock (objeto simulado que NO toca la BD).
 * TareaService recibe ese mock inyectado via @InjectMocks.
 * Así probamos la lógica del Service sin necesitar Oracle ni Spring.
 */
@ExtendWith(MockitoExtension.class)
public class TareaServiceTest {

    // Mock del repositorio
    @Mock
    private TareaRepository tareaRepository;

    // Objeto real que vamos a testear, con el mock inyectado
    @InjectMocks
    private TareaService tareaService;

    // Datos de prueba
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

    // TEST 1: guardar una tarea
    @Test
    void guardar_debeRetornarTareaGuardada() {
        // Indicamos al mock qué debe devolver cuando se llame save()
        when(tareaRepository.save(tareaEjemplo)).thenReturn(tareaEjemplo);

        Tarea resultado = tareaService.guardar(tareaEjemplo);

        assertNotNull(resultado);
        assertEquals("Implementar login", resultado.getNombre());
        // Verificamos que save() fue llamado exactamente 1 vez
        verify(tareaRepository, times(1)).save(tareaEjemplo);
    }

    // TEST 2: obtener todas las tareas
    @Test
    void obtenerTodas_debeRetornarListaDeTareas() {
        Tarea tarea2 = new Tarea();
        tarea2.setId(2L);
        tarea2.setNombre("Diseñar UI");

        when(tareaRepository.findAll()).thenReturn(Arrays.asList(tareaEjemplo, tarea2));

        List<Tarea> tareas = tareaService.obtenerTodas();

        assertEquals(2, tareas.size());
        verify(tareaRepository, times(1)).findAll();
    }

    // TEST 3: buscar por ID existente
    @Test
    void obtenerPorId_cuandoExiste_debeRetornarTarea() {
        when(tareaRepository.findById(1L)).thenReturn(Optional.of(tareaEjemplo));

        Optional<Tarea> resultado = tareaService.obtenerPorId(1L);

        assertTrue(resultado.isPresent());
        assertEquals(1L, resultado.get().getId());
        verify(tareaRepository, times(1)).findById(1L);
    }

    // TEST 4: buscar por ID que NO existe 
    @Test
    void obtenerPorId_cuandoNoExiste_debeRetornarEmpty() {
        when(tareaRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Tarea> resultado = tareaService.obtenerPorId(999L);

        assertFalse(resultado.isPresent());
        verify(tareaRepository, times(1)).findById(999L);
    }

    // TEST 5: buscar por estatus
    @Test
    void obtenerPorEstatus_debeRetornarTareasFiltradas() {
        when(tareaRepository.findByEstatus("Pendiente"))
                .thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorEstatus("Pendiente");

        assertEquals(1, resultado.size());
        assertEquals("Pendiente", resultado.get(0).getEstatus());
        verify(tareaRepository, times(1)).findByEstatus("Pendiente");
    }

    // TEST 6: buscar por prioridad 
    @Test
    void obtenerPorPrioridad_debeRetornarTareasDeAlta() {
        when(tareaRepository.findByPrioridad("Alta"))
                .thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorPrioridad("Alta");

        assertFalse(resultado.isEmpty());
        assertEquals("Alta", resultado.get(0).getPrioridad());
    }

    // TEST 7: buscar por sprint
    @Test
    void obtenerPorSprint_debeRetornarTareasDelSprint() {
        when(tareaRepository.findBySprintId(10L)).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorSprint(10L);

        assertEquals(1, resultado.size());
        assertEquals(10L, resultado.get(0).getSprintId());
    }

    // TEST 8: buscar por usuario asignado
    @Test
    void obtenerPorAsignado_debeRetornarTareasDelUsuario() {
        when(tareaRepository.findByAsignadoA(5L)).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaService.obtenerPorAsignado(5L);

        assertEquals(1, resultado.size());
        assertEquals(5L, resultado.get(0).getAsignadoA());
    }

    // TEST 9: eliminar tarea
    @Test
    void eliminar_debeInvocarDeleteById() {
        // deleteById es void, no necesita when()
        doNothing().when(tareaRepository).deleteById(1L);

        tareaService.eliminar(1L);

        verify(tareaRepository, times(1)).deleteById(1L);
    }

    // TEST 10: obtener tareas activas
    @Test
    void obtenerActivas_debeRetornarTareasNoBorradas() {
        when(tareaRepository.findActivas()).thenReturn(List.of(tareaEjemplo));

        List<Tarea> activas = tareaService.obtenerActivas();

        assertFalse(activas.isEmpty());
        // Verificamos que ninguna tiene borrado = 1
        activas.forEach(t -> assertNotEquals(Integer.valueOf(1), t.getBorrado()));
    }
}
