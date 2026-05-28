package com.polarirob.demopruebanueva.dto;

import com.polarirob.demopruebanueva.model.EstadoReserva;

public class CambiarEstadoReservaRequest {

    private EstadoReserva estado;

    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }
}
