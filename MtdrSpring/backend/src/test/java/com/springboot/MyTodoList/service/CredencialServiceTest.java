package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Credencial;
import com.springboot.MyTodoList.repository.CredencialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CredencialServiceTest {

    @Mock
    private CredencialRepository credencialRepository;

    @InjectMocks
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

    // [Happy path] Verify guardar delegates to repository and returns saved
    @Test
    void guardar_validCredencial_returnsSaved() {
        when(credencialRepository.save(credencialEjemplo)).thenReturn(credencialEjemplo);

        Credencial resultado = credencialService.guardar(credencialEjemplo);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getEmail()).isEqualTo("dev@example.com");
        verify(credencialRepository, times(1)).save(credencialEjemplo);
    }

    // [Happy path] Verify obtenerTodas returns list
    @Test
    void obtenerTodas_always_returnsList() {
        when(credencialRepository.findAll()).thenReturn(List.of(credencialEjemplo));

        List<Credencial> resultado = credencialService.obtenerTodas();

        assertThat(resultado).hasSize(1);
        verify(credencialRepository, times(1)).findAll();
    }

    // [Found] Verify obtenerPorId returns Optional present
    @Test
    void obtenerPorId_existingId_returnsOptionalPresent() {
        when(credencialRepository.findById(10L)).thenReturn(Optional.of(credencialEjemplo));

        Optional<Credencial> resultado = credencialService.obtenerPorId(10L);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getId()).isEqualTo(10L);
        verify(credencialRepository, times(1)).findById(10L);
    }

    // [Not found] Verify obtenerPorId returns Optional empty
    @Test
    void obtenerPorId_nonExistingId_returnsOptionalEmpty() {
        when(credencialRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Credencial> resultado = credencialService.obtenerPorId(999L);

        assertThat(resultado).isEmpty();
        verify(credencialRepository, times(1)).findById(999L);
    }

    // [Happy path] Verify obtenerPorEmail delegates
    @Test
    void obtenerPorEmail_existingEmail_returnsCredencial() {
        when(credencialRepository.findByEmail("dev@example.com")).thenReturn(credencialEjemplo);

        Credencial resultado = credencialService.obtenerPorEmail("dev@example.com");

        assertThat(resultado).isNotNull();
        assertThat(resultado.getUserId()).isEqualTo(5L);
        verify(credencialRepository, times(1)).findByEmail("dev@example.com");
    }

    // [Found by user] Verify obtenerPorUsuario returns Optional present
    @Test
    void obtenerPorUsuario_existingUserId_returnsOptionalPresent() {
        when(credencialRepository.findByUserId(5L)).thenReturn(Optional.of(credencialEjemplo));

        Optional<Credencial> resultado = credencialService.obtenerPorUsuario(5L);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getEmail()).isEqualTo("dev@example.com");
        verify(credencialRepository, times(1)).findByUserId(5L);
    }

    // [Not found by user] Verify obtenerPorUsuario returns Optional empty
    @Test
    void obtenerPorUsuario_nonExistingUserId_returnsOptionalEmpty() {
        when(credencialRepository.findByUserId(999L)).thenReturn(Optional.empty());

        Optional<Credencial> resultado = credencialService.obtenerPorUsuario(999L);

        assertThat(resultado).isEmpty();
        verify(credencialRepository, times(1)).findByUserId(999L);
    }

    // [Happy path] Verify eliminar delegates to deleteById
    @Test
    void eliminar_existingId_delegatesToRepository() {
        doNothing().when(credencialRepository).deleteById(10L);

        credencialService.eliminar(10L);

        verify(credencialRepository, times(1)).deleteById(10L);
    }
}
