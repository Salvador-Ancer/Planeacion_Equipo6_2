package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmbeddingSyncService embeddingSyncService;

    public UsuarioService(UsuarioRepository usuarioRepository, EmbeddingSyncService embeddingSyncService) {
        this.usuarioRepository = usuarioRepository;
        this.embeddingSyncService = embeddingSyncService;
    }

    public Usuario guardar(Usuario usuario) {
        Usuario guardado = usuarioRepository.save(usuario);
        embeddingSyncService.syncUsuario(guardado.getId());
        return guardado;
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> obtenerPorTelegram(Long telegramId) {
        return usuarioRepository.findByTelegramId(telegramId);
    }

    public Optional<Usuario> obtenerPorTelefono(String telefono) {
        return usuarioRepository.findByTelefono(telefono);
    }

    public List<Usuario> obtenerDevelopers() {
        return usuarioRepository.findByRolIgnoreCase("Developer");
    }

    public Usuario vincularTelegram(Usuario usuario, Long telegramId) {
        usuario.setTelegramId(telegramId);
        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}