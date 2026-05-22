package com.polarirob.demopruebanueva.model;

import jakarta.persistence.*;

@Entity
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_mesa", unique = true, nullable = false)
    private Integer numeroMesa;   // identificador visible

    @Column(nullable = false)
    private Integer capacidad;

    public Mesa() {}

    public Mesa(Integer numeroMesa, Integer capacidad) {
        this.numeroMesa = numeroMesa;
        this.capacidad = capacidad;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
}
