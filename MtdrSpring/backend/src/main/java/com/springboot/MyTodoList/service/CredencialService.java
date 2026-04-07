package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Credencial;
import com.springboot.MyTodoList.repository.CredencialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CredencialService {

    private final CredencialRepository credencialRepository;

    public CredencialService(CredencialRepository credencialRepository) {
        this.credencialRepository = credencialRepository;
    }

    public Credencial guardar(Credencial credencial) {
        return credencialRepository.save(credencial);
    }

    public List<Credencial> obtenerTodas() {
        return credencialRepository.findAll();
    }

    public Optional<Credencial> obtenerPorPassword(String password) {
        return credencialRepository.findById(password);
    }

    public Credencial obtenerPorEmail(String email) {
        return credencialRepository.findByEmail(email);
    }

    public void eliminar(String password) {
        credencialRepository.deleteById(password);
    }
}