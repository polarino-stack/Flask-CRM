package com.polarirob.demopruebanueva.repository;

import com.polarirob.demopruebanueva.model.CategoriaStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaStockRepository extends JpaRepository<CategoriaStock, Long> {
    Optional<CategoriaStock> findByNombre(String nombre);
    List<CategoriaStock> findAllByOrderByIdAsc();
}
