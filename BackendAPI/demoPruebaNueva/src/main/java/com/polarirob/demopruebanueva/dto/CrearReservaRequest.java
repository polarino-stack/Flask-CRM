package com.polarirob.demopruebanueva.dto;

import com.polarirob.demopruebanueva.model.Mesa;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class CrearReservaRequest {

    private Long mesaId;
    private Mesa mesa;
    private Long turnoId;
    private String nombreCliente;
    private String telefonoCliente;
    private Integer numeroPersonas;
    private LocalDate fechaReserva;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private LocalDateTime fechaHoraInicio;
    private Integer duracionMinutos;
    private String observaciones;

    public Long getMesaId() { return mesaId; }
    public void setMesaId(Long mesaId) { this.mesaId = mesaId; }

    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public Long getTurnoId() { return turnoId; }
    public void setTurnoId(Long turnoId) { this.turnoId = turnoId; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public Integer getNumeroPersonas() { return numeroPersonas; }
    public void setNumeroPersonas(Integer numeroPersonas) { this.numeroPersonas = numeroPersonas; }

    public LocalDate getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(LocalDate fechaReserva) { this.fechaReserva = fechaReserva; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }

    public LocalDateTime getFechaHoraInicio() { return fechaHoraInicio; }
    public void setFechaHoraInicio(LocalDateTime fechaHoraInicio) { this.fechaHoraInicio = fechaHoraInicio; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
