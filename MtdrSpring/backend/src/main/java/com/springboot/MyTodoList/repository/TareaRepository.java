package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
@EnableTransactionManagement
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByEstatus(String estatus);
    List<Tarea> findByPrioridad(String prioridad);
    List<Tarea> findBySprintId(Long sprintId);
    List<Tarea> findByProyectoId(Long proyectoId);
    List<Tarea> findByAsignadoA(Long userId);
    List<Tarea> findByBorrado(Integer borrado);

    @Query("SELECT t FROM Tarea t WHERE t.borrado IS NULL OR t.borrado = 0")
    List<Tarea> findActivas();
}