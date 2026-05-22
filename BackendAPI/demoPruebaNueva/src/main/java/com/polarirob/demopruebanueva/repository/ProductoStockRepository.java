package com.polarirob.demopruebanueva.repository;

import com.polarirob.demopruebanueva.model.ProductoStock;
import com.polarirob.demopruebanueva.model.CategoriaStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoStockRepository extends JpaRepository<ProductoStock, Long> {
    Optional<ProductoStock> findByCategoriaAndNombre(CategoriaStock categoria, String nombre);
    List<ProductoStock> findAllByOrderByIdAsc();
    List<ProductoStock> findAllByOrderByCategoriaNombreAscNombreAsc();
}
