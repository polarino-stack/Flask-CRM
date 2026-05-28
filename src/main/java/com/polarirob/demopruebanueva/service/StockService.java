package com.polarirob.demopruebanueva.service;

import com.polarirob.demopruebanueva.dto.CrearProductoStockRequest;
import com.polarirob.demopruebanueva.model.CategoriaStock;
import com.polarirob.demopruebanueva.model.ProductoStock;
import com.polarirob.demopruebanueva.repository.CategoriaStockRepository;
import com.polarirob.demopruebanueva.repository.ProductoStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    private final CategoriaStockRepository categoriaStockRepository;
    private final ProductoStockRepository productoStockRepository;

    public StockService(CategoriaStockRepository categoriaStockRepository,
                        ProductoStockRepository productoStockRepository) {
        this.categoriaStockRepository = categoriaStockRepository;
        this.productoStockRepository = productoStockRepository;
    }

    @Transactional
    public ProductoStock crearProducto(CrearProductoStockRequest request) {
        validarRequest(request);

        CategoriaStock categoria = resolverCategoria(request);
        productoStockRepository.findByCategoriaAndNombre(categoria, request.getNombre().trim())
                .ifPresent(producto -> {
                    throw new IllegalStateException("Ya existe un producto con ese nombre en la categoria");
                });

        ProductoStock producto = new ProductoStock(
                categoria,
                request.getNombre().trim(),
                request.getCantidad(),
                normalizarOpcional(request.getTelefonoProveedor())
        );
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0);
        producto.setUnidadMedida(normalizarUnidad(request.getUnidadMedida()));
        return productoStockRepository.save(producto);
    }

    @Transactional
    public ProductoStock actualizarProducto(Long productoId, CrearProductoStockRequest request) {
        if (productoId == null) {
            throw new IllegalArgumentException("El producto indicado no existe");
        }

        ProductoStock producto = productoStockRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("El producto indicado no existe"));

        validarRequest(request);

        CategoriaStock categoria = resolverCategoria(request);
        productoStockRepository.findByCategoriaAndNombre(categoria, request.getNombre().trim())
                .ifPresent(existente -> {
                    if (!existente.getId().equals(productoId)) {
                        throw new IllegalStateException("Ya existe un producto con ese nombre en la categoria");
                    }
                });

        producto.setCategoria(categoria);
        producto.setNombre(request.getNombre().trim());
        producto.setCantidad(request.getCantidad());
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0);
        producto.setUnidadMedida(normalizarUnidad(request.getUnidadMedida()));
        producto.setTelefonoProveedor(normalizarOpcional(request.getTelefonoProveedor()));
        return productoStockRepository.save(producto);
    }

    @Transactional
    public void eliminarProducto(Long productoId) {
        if (productoId == null || !productoStockRepository.existsById(productoId)) {
            throw new IllegalArgumentException("El producto indicado no existe");
        }
        productoStockRepository.deleteById(productoId);
    }

    private CategoriaStock resolverCategoria(CrearProductoStockRequest request) {
        if (request.getCategoriaId() != null) {
            return categoriaStockRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new IllegalArgumentException("La categoria indicada no existe"));
        }
        if (request.getCategoria() != null && request.getCategoria().getId() != null) {
            return categoriaStockRepository.findById(request.getCategoria().getId())
                    .orElseThrow(() -> new IllegalArgumentException("La categoria indicada no existe"));
        }

        String nombreCategoria = request.getCategoriaNombre().trim();
        return categoriaStockRepository.findByNombre(nombreCategoria)
                .orElseGet(() -> categoriaStockRepository.save(new CategoriaStock(nombreCategoria)));
    }

    private void validarRequest(CrearProductoStockRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("El producto es obligatorio");
        }
        if (request.getCategoriaId() == null &&
                (request.getCategoria() == null || request.getCategoria().getId() == null) &&
                (request.getCategoriaNombre() == null || request.getCategoriaNombre().trim().isEmpty())) {
            throw new IllegalArgumentException("La categoria es obligatoria");
        }
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (request.getCantidad() == null || request.getCantidad() < 0) {
            throw new IllegalArgumentException("La cantidad no puede ser negativa");
        }
        if (request.getStockMinimo() != null && request.getStockMinimo() < 0) {
            throw new IllegalArgumentException("El stock minimo no puede ser negativo");
        }
    }

    private String normalizarUnidad(String unidadMedida) {
        if (unidadMedida == null || unidadMedida.trim().isEmpty()) {
            return "unidades";
        }
        return unidadMedida.trim();
    }

    private String normalizarOpcional(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.trim();
    }
}
