package com.polarirob.demopruebanueva.service;

import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.model.Reserva;
import com.polarirob.demopruebanueva.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    public boolean isMesaAvailable(Mesa mesa, LocalDateTime inicio, LocalDateTime fin) {
        return reservaRepository.findOverlappingReservas(mesa.getId(), inicio, fin).isEmpty();
    }

    public Reserva crearReserva(Reserva reserva) {
        LocalDateTime inicio = reserva.getFechaHoraInicio();
        LocalDateTime fin = reserva.getFechaHoraFin();

        if (inicio.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No se puede reservar en una fecha/hora pasada");
        }
        if (!isMesaAvailable(reserva.getMesa(), inicio, fin)) {
            throw new RuntimeException("La mesa ya está reservada en ese horario");
        }
        return reservaRepository.save(reserva);
    }
}