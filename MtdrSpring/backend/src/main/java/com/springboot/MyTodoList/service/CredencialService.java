package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Credencial;
import com.springboot.MyTodoList.repository.CredencialRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CredencialService {

    private final CredencialRepository credencialRepository;

    public CredencialService(CredencialRepository CredencialRepository) {
        this.credencialRepository = CredencialRepository;
    }

    public Credencial guardar(Credencial Credencial) {
        return credencialRepository.save(Credencial);
    }

    public List<Credencial> obtenerTodas() {
        return credencialRepository.findAll();
    }

    public Optional<Credencial> obtenerPorId(Long id) {
        return credencialRepository.findById(id);
    }

    public Credencial obtenerPorEmail(String email) {
        return credencialRepository.findByEmail(email);
    }

    public Optional<Credencial> obtenerPorUsuario(Long userId) {
        return credencialRepository.findByUserId(userId);
    }

    public void eliminar(Long id) {
        credencialRepository.deleteById(id);
    }
}