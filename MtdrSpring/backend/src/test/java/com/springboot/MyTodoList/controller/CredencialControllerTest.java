package com.springboot.MyTodoList.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.Credencial;
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

import java.util.Date;
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

@WebMvcTest(controllers = CredencialController.class)
@AutoConfigureMockMvc(addFilters = false)
class CredencialControllerTest {

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

    private Credencial credencialEjemplo;

    @BeforeEach
    void setUp() {
        credencialEjemplo = new Credencial();
        credencialEjemplo.setId(10L);
        credencialEjemplo.setEmail("dev@example.com");
        credencialEjemplo.setHashPassword("$2a$10$hash");
        credencialEjemplo.setActivo(1);
        credencialEjemplo.setUserId(5L);
        credencialEjemplo.setFechaCreacion(new Date());
    }

    // [Happy path] Verify guardar is called and returns 201
    @Test
    void create_validCredencial_returns201() throws Exception {
        when(credencialService.guardar(any(Credencial.class))).thenReturn(credencialEjemplo);

        var result = mockMvc.perform(post("/credenciales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credencialEjemplo)))
                .andExpect(status().isCreated())
                .andReturn();

        Credencial response = objectMapper.readValue(result.getResponse().getContentAsString(), Credencial.class);
        assertThat(response.getId()).isEqualTo(10L);
        verify(credencialService, times(1)).guardar(any(Credencial.class));
    }

    // [Found by user] Verify obtenerPorUsuario returns 200 with body
    @Test
    void getByUsuario_existingUserId_returns200() throws Exception {
        when(credencialService.obtenerPorUsuario(5L)).thenReturn(Optional.of(credencialEjemplo));

        var result = mockMvc.perform(get("/credenciales/usuario/5"))
                .andExpect(status().isOk())
                .andReturn();

        Credencial response = objectMapper.readValue(result.getResponse().getContentAsString(), Credencial.class);
        assertThat(response.getUserId()).isEqualTo(5L);
        verify(credencialService, times(1)).obtenerPorUsuario(5L);
    }

    // [Not found by user] Verify obtenerPorUsuario empty returns 404
    @Test
    void getByUsuario_nonExistingUserId_returns404() throws Exception {
        when(credencialService.obtenerPorUsuario(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/credenciales/usuario/999"))
                .andExpect(status().isNotFound());

        verify(credencialService, times(1)).obtenerPorUsuario(999L);
    }

    // [Found by id] Verify obtenerPorId returns 200 with body
    @Test
    void getById_existingId_returns200() throws Exception {
        when(credencialService.obtenerPorId(10L)).thenReturn(Optional.of(credencialEjemplo));

        var result = mockMvc.perform(get("/credenciales/10"))
                .andExpect(status().isOk())
                .andReturn();

        Credencial response = objectMapper.readValue(result.getResponse().getContentAsString(), Credencial.class);
        assertThat(response.getEmail()).isEqualTo("dev@example.com");
        verify(credencialService, times(1)).obtenerPorId(10L);
    }

    // [Not found by id] Verify obtenerPorId empty returns 404
    @Test
    void getById_nonExistingId_returns404() throws Exception {
        when(credencialService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/credenciales/999"))
                .andExpect(status().isNotFound());

        verify(credencialService, times(1)).obtenerPorId(999L);
    }

    // [Not found] Verify update returns 404 when id does not exist
    @Test
    void update_nonExistingId_returns404() throws Exception {
        when(credencialService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/credenciales/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credencialEjemplo)))
                .andExpect(status().isNotFound());

        verify(credencialService, never()).guardar(any(Credencial.class));
    }

    // [Happy path] Verify path ID takes precedence (credencial.setId(id) before save)
    @Test
    void update_existingId_setsIdAndReturns200() throws Exception {
        when(credencialService.obtenerPorId(10L)).thenReturn(Optional.of(credencialEjemplo));
        when(credencialService.guardar(any(Credencial.class))).thenReturn(credencialEjemplo);

        Credencial request = new Credencial();
        request.setId(999L);
        request.setEmail("dev@example.com");
        request.setUserId(5L);

        mockMvc.perform(put("/credenciales/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        ArgumentCaptor<Credencial> captor = ArgumentCaptor.forClass(Credencial.class);
        verify(credencialService, times(1)).guardar(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(10L);
    }

    // [Not found] Verify delete returns 404 when id does not exist
    @Test
    void delete_nonExistingId_returns404() throws Exception {
        when(credencialService.obtenerPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/credenciales/999"))
                .andExpect(status().isNotFound());

        verify(credencialService, never()).eliminar(999L);
    }

    // [Happy path] Verify delete calls eliminar and returns 204
    @Test
    void delete_existingId_returns204() throws Exception {
        when(credencialService.obtenerPorId(10L)).thenReturn(Optional.of(credencialEjemplo));

        mockMvc.perform(delete("/credenciales/10"))
                .andExpect(status().isNoContent());

        verify(credencialService, times(1)).eliminar(10L);
    }
}
