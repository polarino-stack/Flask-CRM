package com.polarirob.demopruebanueva.repository;

import com.polarirob.demopruebanueva.model.TurnoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TurnoReservaRepository extends JpaRepository<TurnoReserva, Long> {
    List<TurnoReserva> findAllByOrderByHoraInicioAsc();
    Optional<TurnoReserva> findByNombre(String nombre);
    Optional<TurnoReserva> findFirstByActivoTrueAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
            LocalTime horaInicio,
            LocalTime horaFin
    );
}
