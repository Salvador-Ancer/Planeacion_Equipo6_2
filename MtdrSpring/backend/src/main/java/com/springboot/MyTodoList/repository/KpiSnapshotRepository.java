package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.KpiSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
@EnableTransactionManagement
public interface KpiSnapshotRepository extends JpaRepository<KpiSnapshot, Long> {
    List<KpiSnapshot> findByKpiId(Long kpiId);
    List<KpiSnapshot> findBySprintId(Long sprintId);
    List<KpiSnapshot> findByKpiIdAndSprintId(Long kpiId, Long sprintId);
}