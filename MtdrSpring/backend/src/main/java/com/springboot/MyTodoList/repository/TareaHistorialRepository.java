package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TareaHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
@EnableTransactionManagement
public interface TareaHistorialRepository extends JpaRepository<TareaHistorial, Long> {
    List<TareaHistorial> findByTareaId(Long tareaId);
    List<TareaHistorial> findByTareaIdAndCampo(Long tareaId, String campo);
    List<TareaHistorial> findByModificadoPor(Long userId);
}