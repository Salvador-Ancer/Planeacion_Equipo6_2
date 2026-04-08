package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TareaKpi;
import com.springboot.MyTodoList.model.TareaKpiId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
@EnableTransactionManagement
public interface TareaKpiRepository extends JpaRepository<TareaKpi, TareaKpiId> {
    List<TareaKpi> findByTareaId(Long tareaId);
    List<TareaKpi> findByKpiId(Long kpiId);
}