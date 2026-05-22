package com.polarirob.demopruebanueva.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellido;

    @Column(name = "numero_telefono", length = 30)
    private String numeroTelefono;

    @Column(unique = true, nullable = false, length = 20)
    private String dni;

    @Column(name = "horas_semanales", nullable = false)
    private Integer horasSemanales;

    @Column(name = "horas_mensuales", nullable = false)
    private Integer horasMensuales;

    public Empleado() {}

    public Empleado(String nombre, String apellido, String numeroTelefono, String dni,
                    Integer horasSemanales, Integer horasMensuales) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.numeroTelefono = numeroTelefono;
        this.dni = dni;
        this.horasSemanales = horasSemanales;
        this.horasMensuales = horasMensuales;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getNumeroTelefono() { return numeroTelefono; }
    public void setNumeroTelefono(String numeroTelefono) { this.numeroTelefono = numeroTelefono; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public Integer getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Integer horasSemanales) { this.horasSemanales = horasSemanales; }

    public Integer getHorasMensuales() { return horasMensuales; }
    public void setHorasMensuales(Integer horasMensuales) { this.horasMensuales = horasMensuales; }
}
