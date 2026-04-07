package com.springboot.MyTodoList.repository;


import com.springboot.MyTodoList.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.transaction.Transactional;

@Repository
@Transactional
@EnableTransactionManagement
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Usuario findByEmail(String email);

}

