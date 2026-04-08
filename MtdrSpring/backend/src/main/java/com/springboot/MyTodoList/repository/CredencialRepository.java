package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Credencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Repository
@Transactional
@EnableTransactionManagement
public interface CredencialRepository extends JpaRepository<Credencial, Long> {
    Credencial findByEmail(String email);
    Optional<Credencial> findByUserId(Long userId);
}