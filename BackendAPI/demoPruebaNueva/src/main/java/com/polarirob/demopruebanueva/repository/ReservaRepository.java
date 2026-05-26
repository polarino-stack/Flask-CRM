package com.polarirob.demopruebanueva.repository;

import com.polarirob.demopruebanueva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query(value = "SELECT * FROM reserva r WHERE r.mesa_id = :mesaId " +
            "AND r.estado <> 'CANCELADA' " +
            "AND r.fecha_hora_inicio < :fin " +
            "AND DATE_ADD(r.fecha_hora_inicio, INTERVAL r.duracion_minutos MINUTE) > :inicio",
            nativeQuery = true)
    List<Reserva> findOverlappingReservas(@Param("mesaId") Long mesaId,
                                          @Param("inicio") LocalDateTime inicio,
                                          @Param("fin") LocalDateTime fin);

    @Query(value = "SELECT * FROM reserva r WHERE r.mesa_id = :mesaId " +
            "AND r.fecha_reserva = :fechaReserva " +
            "AND r.estado NOT IN ('CANCELADA', 'NO_PRESENTADO', 'FINALIZADA', 'COMPLETADA') " +
            "AND r.hora_inicio < :horaFin " +
            "AND r.hora_fin > :horaInicio",
            nativeQuery = true)
    List<Reserva> findReservasSolapadas(@Param("mesaId") Long mesaId,
                                        @Param("fechaReserva") LocalDate fechaReserva,
                                        @Param("horaInicio") LocalTime horaInicio,
                                        @Param("horaFin") LocalTime horaFin);

    List<Reserva> findAllByOrderByFechaReservaAscHoraInicioAscMesaNumeroMesaAsc();

    List<Reserva> findByFechaReservaOrderByHoraInicioAscMesaNumeroMesaAsc(LocalDate fechaReserva);

    List<Reserva> findByFechaReservaAndTurnoIdOrderByHoraInicioAscMesaNumeroMesaAsc(
            LocalDate fechaReserva,
            Long turnoId
    );
}
