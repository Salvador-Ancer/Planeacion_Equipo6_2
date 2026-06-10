package com.springboot.MyTodoList.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.CredencialService;
import com.springboot.MyTodoList.service.KpiCalculatorService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TareaController.class)
@AutoConfigureMockMvc(addFilters = false)
class TareaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TareaService tareaService;

    @MockBean
    private UsuarioService usuarioService;

    @MockBean
    private KpiCalculatorService kpiCalculatorService;

    @MockBean
    private CredencialService credencialService;

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

    // [Null/blank validation] Verify blank nombre returns 400 with message
    @Test
    void create_nombreIsBlank_returns400() throws Exception {
        Tarea sinNombre = new Tarea();
        sinNombre.setId(123L);
        sinNombre.setNombre("   ");

        var result = mockMvc.perform(post("/tareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sinNombre)))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).isEqualTo("El campo 'nombre' es obligatorio");
        verify(tareaService, never()).guardar(any(Tarea.class));
    }

    // [Happy path] Verify valid Tarea saved and returns 201 with body
    @Test
    void create_validTarea_returns201WithBody() throws Exception {
        Tarea request = new Tarea();
        request.setId(123L);
        request.setNombre("Nueva tarea");
        request.setBorrado(0);
        request.setFechaCreacion(new Date());

        Tarea saved = new Tarea();
        saved.setId(123L);
        saved.setNombre("Nueva tarea");
        saved.setBorrado(0);
        saved.setFechaCreacion(request.getFechaCreacion());

        when(tareaService.guardar(any(Tarea.class))).thenReturn(saved);

        var result = mockMvc.perform(post("/tareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Tarea responseBody = objectMapper.readValue(result.getResponse().getContentAsString(), Tarea.class);
        assertThat(responseBody.getId()).isEqualTo(123L);
        assertThat(responseBody.getNombre()).isEqualTo("Nueva tarea");
        verify(tareaService, times(1)).guardar(any(Tarea.class));
    }

    // [Default values] Verify null borrado/fechaCreacion are defaulted before save
    @Test
    void create_missingOptionalFields_setsDefaults() throws Exception {
        Instant before = Instant.now();

        Tarea request = new Tarea();
        request.setId(123L);
        request.setNombre("Tarea sin defaults");
        request.setBorrado(null);
        request.setFechaCreacion(null);

        when(tareaService.guardar(any(Tarea.class))).thenReturn(tareaEjemplo);

        mockMvc.perform(post("/tareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        ArgumentCaptor<Tarea> captor = ArgumentCaptor.forClass(Tarea.class);
        verify(tareaService, times(1)).guardar(captor.capture());

        Tarea toSave = captor.getValue();
        assertThat(toSave.getBorrado()).isEqualTo(0);
        assertThat(toSave.getFechaCreacion()).isNotNull();
        assertThat(toSave.getFechaCreacion().toInstant())
                .isBetween(before.minus(2, ChronoUnit.SECONDS), Instant.now().plus(2, ChronoUnit.SECONDS));
    }

    // [Happy path] Verify obtenerTodas called and list returned
    @Test
    void getAll_always_returnsListWith200() throws Exception {
        when(tareaService.obtenerTodas()).thenReturn(List.of(tareaEjemplo));

        var result = mockMvc.perform(get("/tareas"))
                .andExpect(status().isOk())
                .andReturn();

        Tarea[] response = objectMapper.readValue(result.getResponse().getContentAsString(), Tarea[].class);
        assertThat(response).hasSize(1);
        assertThat(response[0].getNombre()).isEqualTo("Implementar login");
        verify(tareaService, times(1)).obtenerTodas();
    }

    // [Found] Verify present Optional returns 200 with body
    @Test
    void getById_existingId_returns200WithTarea() throws Exception {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));

        var result = mockMvc.perform(get("/tareas/1"))
                .andExpect(status().isOk())
                .andReturn();

        Tarea response = objectMapper.readValue(result.getResponse().getContentAsString(), Tarea.class);
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNombre()).isEqualTo("Implementar login");
        verify(tareaService, times(1)).obtenerPorId(1L);
    }

    // [Not found] Verify empty Optional returns 404
    @Test
    void getById_nonExistingId_returns404() throws Exception {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/tareas/999"))
                .andExpect(status().isNotFound());

        verify(tareaService, times(1)).obtenerPorId(999L);
    }

    // [Not found] Verify update returns 404 when tarea does not exist
    @Test
    void update_nonExistingId_returns404() throws Exception {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/tareas/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tareaEjemplo)))
                .andExpect(status().isNotFound());

        verify(tareaService, never()).guardar(any(Tarea.class));
    }

    // [Invalid user] Verify invalid asignadoA returns 400
    @Test
    void update_invalidAsignadoA_returns400() throws Exception {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));
        when(usuarioService.obtenerPorId(55L)).thenReturn(Optional.empty());

        Tarea request = new Tarea();
        request.setNombre("Actualizar tarea");
        request.setAsignadoA(55L);

        mockMvc.perform(put("/tareas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(tareaService, never()).guardar(any(Tarea.class));
    }

    // [KPI recalculation] Verify KPI services are called after save when sprintId/proyectoId present
    @Test
    void update_validTareaWithSprint_triggersKpiRecalculation() throws Exception {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));

        Tarea request = new Tarea();
        request.setNombre("Tarea actualizada");
        request.setSprintId(10L);
        request.setProyectoId(100L);

        Tarea saved = new Tarea();
        saved.setId(1L);
        saved.setNombre("Tarea actualizada");
        saved.setSprintId(10L);
        saved.setProyectoId(100L);
        saved.setBorrado(0);
        saved.setFechaCreacion(tareaEjemplo.getFechaCreacion());

        when(tareaService.guardar(any(Tarea.class))).thenReturn(saved);

        mockMvc.perform(put("/tareas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(kpiCalculatorService, times(1)).recalcularPorSprint(10L, 100L);
        verify(kpiCalculatorService, times(1)).recalcularPorProyecto(100L);
    }

    // [Not found] Verify delete returns 404 when tarea does not exist
    @Test
    void delete_nonExistingId_returns404() throws Exception {
        when(tareaService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/tareas/999"))
                .andExpect(status().isNotFound());

        verify(tareaService, never()).eliminar(999L);
    }

    // [Happy path] Verify delete calls eliminar and returns 204
    @Test
    void delete_existingId_returns204() throws Exception {
        when(tareaService.obtenerPorId(1L)).thenReturn(Optional.of(tareaEjemplo));

        mockMvc.perform(delete("/tareas/1"))
                .andExpect(status().isNoContent());

        verify(tareaService, times(1)).eliminar(1L);
    }
}
