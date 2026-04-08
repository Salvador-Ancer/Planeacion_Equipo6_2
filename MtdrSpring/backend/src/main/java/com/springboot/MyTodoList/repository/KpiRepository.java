package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Kpi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
@EnableTransactionManagement
public interface KpiRepository extends JpaRepository<Kpi, Long> {
    List<Kpi> findByProyectoId(Long proyectoId);
    List<Kpi> findBySprintId(Long sprintId);
    List<Kpi> findByUserId(Long userId);
}