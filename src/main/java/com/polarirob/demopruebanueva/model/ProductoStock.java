package com.polarirob.demopruebanueva.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(name = "uk_producto_stock_categoria_nombre", columnNames = {"categoria_id", "nombre"})
})
public class ProductoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaStock categoria;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 0;

    @Column(name = "unidad_medida", nullable = false, length = 30)
    private String unidadMedida = "unidades";

    @Column(name = "telefono_proveedor", length = 30)
    private String telefonoProveedor;

    public ProductoStock() {}

    public ProductoStock(CategoriaStock categoria, String nombre, Integer cantidad, String telefonoProveedor) {
        this.categoria = categoria;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.telefonoProveedor = telefonoProveedor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CategoriaStock getCategoria() { return categoria; }
    public void setCategoria(CategoriaStock categoria) { this.categoria = categoria; }

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
