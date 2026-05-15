package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests de TareaController usando Mockito puro (sin levantar Spring).
 *
 * Se mockean TareaService y UsuarioService para aislar la lógica del controller.
 * Verificamos los códigos HTTP y los datos devueltos.
 */
@ExtendWith(MockitoExtension.class)
public class TareaControllerTest {

    @Mock
    private TareaService tareaService;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private TareaController tareaController;

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

    // TEST 1: GET /tareas — retorna lista 
    @Test
    void getAll_debeRetornarListaDeTareas() {
        when(tareaService.obtenerTodas()).thenReturn(Arrays.asList(tareaEjemplo));

        List<Tarea> resultado = tareaController.getAll();

        assertEquals(1, resultado.size());
        assertEquals("Implementar login", resultado.get(0).getNombre());
        verify(tareaService, times(1)).obtenerTodas();
    }

    // TEST 2: GET /tareas/{id} — tarea encontrada -> 200
    @Test
    void getById_cuandoExiste_debeRetornar200() {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));

        ResponseEntity<Tarea> response = tareaController.getById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    // TEST 3: GET /tareas/{id} — tarea no encontrada -> 404 
    @Test
    void getById_cuandoNoExiste_debeRetornar404() {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        ResponseEntity<Tarea> response = tareaController.getById(999L);

        assertEquals(404, response.getStatusCode().value());
    }

    // TEST 4: POST /tareas — crear tarea válida -> 201 
    @Test
    void create_conNombreValido_debeRetornar201() {
        Tarea nueva = new Tarea();
        nueva.setNombre("Nueva tarea");
        nueva.setBorrado(0);
        nueva.setFechaCreacion(new Date());

        when(tareaService.guardar(any(Tarea.class))).thenReturn(nueva);

        ResponseEntity<?> response = tareaController.create(nueva);

        assertEquals(201, response.getStatusCode().value());
        verify(tareaService, times(1)).guardar(any(Tarea.class));
    }

    // TEST 5: POST /tareas — nombre vacío -> 400 
    @Test
    void create_sinNombre_debeRetornar400() {
        Tarea sinNombre = new Tarea();
        sinNombre.setNombre("");  // nombre en blanco

        ResponseEntity<?> response = tareaController.create(sinNombre);

        assertEquals(400, response.getStatusCode().value());
        // El service NO debe llamarse si la validación falla
        verify(tareaService, never()).guardar(any(Tarea.class));
    }

    // TEST 6: PUT /tareas/{id} — actualizar existente -> 200 
    @Test
    void update_cuandoExiste_debeRetornar200() {
        Tarea actualizada = new Tarea();
        actualizada.setNombre("Login actualizado");
        actualizada.setEstatus("En progreso");
        actualizada.setBorrado(0);
        actualizada.setFechaCreacion(new Date());

        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));
        when(tareaService.guardar(any(Tarea.class))).thenReturn(actualizada);

        ResponseEntity<Tarea> response = tareaController.update(1L, actualizada);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Login actualizado", response.getBody().getNombre());
    }

    // TEST 7: PUT /tareas/{id} — id no existe -> 404 
    @Test
    void update_cuandoNoExiste_debeRetornar404() {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        ResponseEntity<Tarea> response = tareaController.update(999L, tareaEjemplo);

        assertEquals(404, response.getStatusCode().value());
    }

    // TEST 8: DELETE /tareas/{id} — eliminar existente -> 204 
    @Test
    void delete_cuandoExiste_debeRetornar204() {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));
        doNothing().when(tareaService).eliminar(1L);

        ResponseEntity<Void> response = tareaController.delete(1L);

        assertEquals(204, response.getStatusCode().value());
        verify(tareaService, times(1)).eliminar(1L);
    }

    // TEST 9: DELETE /tareas/{id} — no existe -> 404 
    @Test
    void delete_cuandoNoExiste_debeRetornar404() {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = tareaController.delete(999L);

        assertEquals(404, response.getStatusCode().value());
        verify(tareaService, never()).eliminar(anyLong());
    }

    // TEST 10: GET /tareas/estatus/{estatus} 
    @Test
    void getByEstatus_debeRetornarTareasFiltradas() {
        when(tareaService.obtenerPorEstatus("Pendiente")).thenReturn(List.of(tareaEjemplo));

        List<Tarea> resultado = tareaController.getByEstatus("Pendiente");

        assertEquals(1, resultado.size());
        assertEquals("Pendiente", resultado.get(0).getEstatus());
    }
}
