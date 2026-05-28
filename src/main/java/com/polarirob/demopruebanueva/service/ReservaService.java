package com.polarirob.demopruebanueva.service;

import com.polarirob.demopruebanueva.dto.CrearReservaRequest;
import com.polarirob.demopruebanueva.model.EstadoReserva;
import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.model.Reserva;
import com.polarirob.demopruebanueva.model.TurnoReserva;
import com.polarirob.demopruebanueva.repository.MesaRepository;
import com.polarirob.demopruebanueva.repository.ReservaRepository;
import com.polarirob.demopruebanueva.repository.TurnoReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ReservaService {

    private static final int DURACION_RESERVA_POR_DEFECTO = 90;

    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;
    private final TurnoReservaRepository turnoReservaRepository;

    public ReservaService(MesaRepository mesaRepository,
                          ReservaRepository reservaRepository,
                          TurnoReservaRepository turnoReservaRepository) {
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
        this.turnoReservaRepository = turnoReservaRepository;
    }

    @Transactional
    public Reserva crearReserva(CrearReservaRequest request) {
        validarRequest(request);
        Reserva reserva = new Reserva();
        aplicarDatosReserva(reserva, request, null);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva actualizarReserva(Long reservaId, CrearReservaRequest request) {
        if (reservaId == null) {
            throw new IllegalArgumentException("La reserva indicada no existe");
        }

        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("La reserva indicada no existe"));

        validarRequest(request);
        aplicarDatosReserva(reserva, request, reservaId);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public void eliminarReserva(Long reservaId) {
        if (reservaId == null || !reservaRepository.existsById(reservaId)) {
            throw new IllegalArgumentException("La reserva indicada no existe");
        }
        reservaRepository.deleteById(reservaId);
    }

    @Transactional
    public Reserva cambiarEstado(Long reservaId, EstadoReserva estado) {
        if (estado == null) {
            throw new IllegalArgumentException("El estado es obligatorio");
        }

        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("La reserva indicada no existe"));
        reserva.setEstado(estado);
        return reservaRepository.save(reserva);
    }

    private void validarRequest(CrearReservaRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La reserva es obligatoria");
        }
        if (resolverMesaId(request) == null) {
            throw new IllegalArgumentException("La mesa es obligatoria");
        }
        if (request.getNombreCliente() == null || request.getNombreCliente().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio");
        }
        if (request.getNumeroPersonas() == null || request.getNumeroPersonas() <= 0) {
            throw new IllegalArgumentException("El numero de personas debe ser mayor que cero");
        }
        if (resolverFechaReserva(request) == null) {
            throw new IllegalArgumentException("La fecha de reserva es obligatoria");
        }
        if (resolverHoraInicio(request) == null) {
            throw new IllegalArgumentException("La hora de inicio es obligatoria");
        }
    }

    private void aplicarDatosReserva(Reserva reserva, CrearReservaRequest request, Long reservaIdExcluida) {
        Long mesaId = resolverMesaId(request);
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new IllegalArgumentException("La mesa indicada no existe"));

        if (request.getNumeroPersonas() > mesa.getCapacidad()) {
            throw new IllegalArgumentException("El numero de personas supera la capacidad de la mesa");
        }

        LocalDate fechaReserva = resolverFechaReserva(request);
        LocalTime horaInicio = resolverHoraInicio(request);
        LocalTime horaFin = resolverHoraFin(request, horaInicio);

        if (!horaFin.isAfter(horaInicio)) {
            throw new IllegalArgumentException("La hora de fin debe ser posterior a la hora de inicio");
        }

        TurnoReserva turno = resolverTurno(request, horaInicio);
        validarHorarioDentroDelTurno(turno, horaInicio, horaFin);

        boolean existeSolapamiento = reservaIdExcluida == null
                ? !reservaRepository.findReservasSolapadas(mesa.getId(), fechaReserva, horaInicio, horaFin).isEmpty()
                : !reservaRepository.findReservasSolapadasExcluyendoId(
                        reservaIdExcluida,
                        mesa.getId(),
                        fechaReserva,
                        horaInicio,
                        horaFin
                ).isEmpty();

        if (existeSolapamiento) {
            throw new IllegalStateException("La mesa ya tiene una reserva en ese horario");
        }

        LocalDateTime inicio = LocalDateTime.of(fechaReserva, horaInicio);
        Integer duracionMinutos = calcularDuracionMinutos(horaInicio, horaFin);

        reserva.setMesa(mesa);
        reserva.setTurno(turno);
        reserva.setNombreCliente(request.getNombreCliente().trim());
        reserva.setTelefonoCliente(normalizarOpcional(request.getTelefonoCliente()));
        reserva.setNumeroPersonas(request.getNumeroPersonas());
        reserva.setFechaReserva(fechaReserva);
        reserva.setHoraInicio(horaInicio);
        reserva.setHoraFin(horaFin);
        reserva.setFechaHoraInicio(inicio);
        reserva.setDuracionMinutos(duracionMinutos);
        reserva.setObservaciones(normalizarOpcional(request.getObservaciones()));
    }

    private Long resolverMesaId(CrearReservaRequest request) {
        if (request.getMesaId() != null) {
            return request.getMesaId();
        }
        if (request.getMesa() != null) {
            return request.getMesa().getId();
        }
        return null;
    }

    private TurnoReserva resolverTurno(CrearReservaRequest request, LocalTime horaInicio) {
        if (request.getTurnoId() != null) {
            return turnoReservaRepository.findById(request.getTurnoId())
                    .orElseThrow(() -> new IllegalArgumentException("El turno indicado no existe"));
        }
        return turnoReservaRepository.findFirstByActivoTrueAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
                        horaInicio,
                        horaInicio
                )
                .orElseThrow(() -> new IllegalArgumentException("No existe un turno activo para esa hora"));
    }

    private void validarHorarioDentroDelTurno(TurnoReserva turno, LocalTime horaInicio, LocalTime horaFin) {
        if (!Boolean.TRUE.equals(turno.getActivo())) {
            throw new IllegalArgumentException("El turno indicado no esta activo");
        }
        if (horaInicio.isBefore(turno.getHoraInicio()) || horaFin.isAfter(turno.getHoraFin())) {
            throw new IllegalArgumentException("La reserva debe estar dentro del horario del turno");
        }
    }

    private LocalDate resolverFechaReserva(CrearReservaRequest request) {
        if (request.getFechaReserva() != null) {
            return request.getFechaReserva();
        }
        if (request.getFechaHoraInicio() != null) {
            return request.getFechaHoraInicio().toLocalDate();
        }
        return null;
    }

    private LocalTime resolverHoraInicio(CrearReservaRequest request) {
        if (request.getHoraInicio() != null) {
            return request.getHoraInicio();
        }
        if (request.getFechaHoraInicio() != null) {
            return request.getFechaHoraInicio().toLocalTime();
        }
        return null;
    }

    private LocalTime resolverHoraFin(CrearReservaRequest request, LocalTime horaInicio) {
        if (request.getHoraFin() != null) {
            return request.getHoraFin();
        }

        Integer duracionMinutos = request.getDuracionMinutos() != null
                ? request.getDuracionMinutos()
                : DURACION_RESERVA_POR_DEFECTO;
        if (duracionMinutos <= 0) {
            throw new IllegalArgumentException("La duracion debe ser mayor que cero");
        }
        return horaInicio.plusMinutes(duracionMinutos);
    }

    private Integer calcularDuracionMinutos(LocalTime horaInicio, LocalTime horaFin) {
        return Math.toIntExact(java.time.Duration.between(horaInicio, horaFin).toMinutes());
    }

    private String normalizarOpcional(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.trim();
    }
}
