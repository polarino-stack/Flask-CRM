package com.polarirob.demopruebanueva.dto;

import com.polarirob.demopruebanueva.model.CategoriaStock;

public class CrearProductoStockRequest {

    private Long categoriaId;
    private CategoriaStock categoria;
    private String categoriaNombre;
    private String nombre;
    private Integer cantidad;
    private Integer stockMinimo;
    private String unidadMedida;
    private String telefonoProveedor;

    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }

    public CategoriaStock getCategoria() { return categoria; }
    public void setCategoria(CategoriaStock categoria) { this.categoria = categoria; }

    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public String getTelefonoProveedor() { return telefonoProveedor; }
    public void setTelefonoProveedor(String telefonoProveedor) { this.telefonoProveedor = telefonoProveedor; }
}
