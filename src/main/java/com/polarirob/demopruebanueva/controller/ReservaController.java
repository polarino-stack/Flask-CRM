package com.polarirob.demopruebanueva.controller;

import com.polarirob.demopruebanueva.dto.CambiarEstadoReservaRequest;
import com.polarirob.demopruebanueva.dto.CrearProductoStockRequest;
import com.polarirob.demopruebanueva.dto.CrearReservaRequest;
import com.polarirob.demopruebanueva.model.Empleado;
import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.model.ProductoStock;
import com.polarirob.demopruebanueva.model.Reserva;
import com.polarirob.demopruebanueva.model.TurnoReserva;
import com.polarirob.demopruebanueva.repository.EmpleadoRepository;
import com.polarirob.demopruebanueva.repository.MesaRepository;
import com.polarirob.demopruebanueva.repository.ProductoStockRepository;
import com.polarirob.demopruebanueva.repository.ReservaRepository;
import com.polarirob.demopruebanueva.repository.TurnoReservaRepository;
import com.polarirob.demopruebanueva.service.ReservaService;
import com.polarirob.demopruebanueva.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ReservaController {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ProductoStockRepository productoStockRepository;

    @Autowired
    private TurnoReservaRepository turnoReservaRepository;

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private StockService stockService;

    @GetMapping("/mesas")
    public ResponseEntity<List<Mesa>> listarMesas() {
        return new ResponseEntity<>(mesaRepository.findAllByOrderByNumeroMesaAsc(), HttpStatus.OK);
    }

    @PostMapping("/mesas")
    public ResponseEntity<?> crearMesa(@RequestBody Mesa mesa) {
        if (mesa.getNumeroMesa() == null || mesa.getNumeroMesa() <= 0) {
            return new ResponseEntity<>("El numero de mesa debe ser mayor que cero", HttpStatus.BAD_REQUEST);
        }
        if (mesa.getCapacidad() == null || mesa.getCapacidad() <= 0) {
            return new ResponseEntity<>("La capacidad debe ser mayor que cero", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(mesaRepository.save(mesa), HttpStatus.CREATED);
    }

    @GetMapping("/reservas")
    public ResponseEntity<List<Reserva>> listarReservas(@RequestParam(required = false) LocalDate fecha,
                                                        @RequestParam(required = false) Long turnoId) {
        if (fecha != null && turnoId != null) {
            return new ResponseEntity<>(
                    reservaRepository.findByFechaReservaAndTurnoIdOrderByHoraInicioAscMesaNumeroMesaAsc(fecha, turnoId),
                    HttpStatus.OK
            );
        }
        if (fecha != null) {
            return new ResponseEntity<>(
                    reservaRepository.findByFechaReservaOrderByHoraInicioAscMesaNumeroMesaAsc(fecha),
                    HttpStatus.OK
            );
        }
        return new ResponseEntity<>(
                reservaRepository.findAllByOrderByFechaReservaAscHoraInicioAscMesaNumeroMesaAsc(),
                HttpStatus.OK
        );
    }

    @PostMapping("/reservas")
    public ResponseEntity<?> crearReserva(@RequestBody CrearReservaRequest reserva) {
        try {
            Reserva nueva = reservaService.crearReserva(reserva);
            return new ResponseEntity<>(nueva, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/reservas/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id,
                                               @RequestBody CrearReservaRequest reserva) {
        try {
            return new ResponseEntity<>(reservaService.actualizarReserva(id, reserva), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/reservas/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {
        try {
            reservaService.eliminarReserva(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/reservas/{id}/estado")
    public ResponseEntity<?> cambiarEstadoReserva(@PathVariable Long id,
                                                  @RequestBody CambiarEstadoReservaRequest request) {
        try {
            if (request == null) {
                return new ResponseEntity<>("El estado es obligatorio", HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(reservaService.cambiarEstado(id, request.getEstado()), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/mesas/{id}")
    public ResponseEntity<?> actualizarMesa(@PathVariable Long id, @RequestBody Mesa mesa) {
        try {
            if (mesa.getNumeroMesa() == null || mesa.getNumeroMesa() <= 0) {
                return new ResponseEntity<>("El numero de mesa debe ser mayor que cero", HttpStatus.BAD_REQUEST);
            }
            if (mesa.getCapacidad() == null || mesa.getCapacidad() <= 0) {
                return new ResponseEntity<>("La capacidad debe ser mayor que cero", HttpStatus.BAD_REQUEST);
            }

            Mesa existente = mesaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("La mesa indicada no existe"));

            mesaRepository.findByNumeroMesa(mesa.getNumeroMesa())
                    .ifPresent(otraMesa -> {
                        if (!otraMesa.getId().equals(id)) {
                            throw new IllegalStateException("Ya existe otra mesa con ese numero");
                        }
                    });

            existente.setNumeroMesa(mesa.getNumeroMesa());
            existente.setCapacidad(mesa.getCapacidad());
            return new ResponseEntity<>(mesaRepository.save(existente), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/mesas/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Long id) {
        try {
            if (!mesaRepository.existsById(id)) {
                return new ResponseEntity<>("La mesa indicada no existe", HttpStatus.BAD_REQUEST);
            }
            if (reservaRepository.countByMesaId(id) > 0) {
                return new ResponseEntity<>("No se puede eliminar una mesa con reservas asociadas", HttpStatus.CONFLICT);
            }
            mesaRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/turnos")
    public ResponseEntity<List<TurnoReserva>> listarTurnos() {
        return new ResponseEntity<>(turnoReservaRepository.findAllByOrderByHoraInicioAsc(), HttpStatus.OK);
    }

    @PostMapping("/turnos")
    public ResponseEntity<?> crearTurno(@RequestBody TurnoReserva turno) {
        if (turno.getNombre() == null || turno.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del turno es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (turno.getHoraInicio() == null || turno.getHoraFin() == null) {
            return new ResponseEntity<>("La hora de inicio y fin son obligatorias", HttpStatus.BAD_REQUEST);
        }
        if (!turno.getHoraFin().isAfter(turno.getHoraInicio())) {
            return new ResponseEntity<>("La hora de fin debe ser posterior a la hora de inicio", HttpStatus.BAD_REQUEST);
        }
        if (turno.getActivo() == null) {
            turno.setActivo(true);
        }
        return new ResponseEntity<>(turnoReservaRepository.save(turno), HttpStatus.CREATED);
    }

    @PutMapping("/turnos/{id}")
    public ResponseEntity<?> actualizarTurno(@PathVariable Long id, @RequestBody TurnoReserva turno) {
        try {
            if (turno.getNombre() == null || turno.getNombre().trim().isEmpty()) {
                return new ResponseEntity<>("El nombre del turno es obligatorio", HttpStatus.BAD_REQUEST);
            }
            if (turno.getHoraInicio() == null || turno.getHoraFin() == null) {
                return new ResponseEntity<>("La hora de inicio y fin son obligatorias", HttpStatus.BAD_REQUEST);
            }
            if (!turno.getHoraFin().isAfter(turno.getHoraInicio())) {
                return new ResponseEntity<>("La hora de fin debe ser posterior a la hora de inicio", HttpStatus.BAD_REQUEST);
            }

            TurnoReserva existente = turnoReservaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("El turno indicado no existe"));

            turnoReservaRepository.findByNombre(turno.getNombre().trim())
                    .ifPresent(otroTurno -> {
                        if (!otroTurno.getId().equals(id)) {
                            throw new IllegalStateException("Ya existe otro turno con ese nombre");
                        }
                    });

            existente.setNombre(turno.getNombre().trim());
            existente.setHoraInicio(turno.getHoraInicio());
            existente.setHoraFin(turno.getHoraFin());
            if (turno.getActivo() != null) {
                existente.setActivo(turno.getActivo());
            }
            return new ResponseEntity<>(turnoReservaRepository.save(existente), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/turnos/{id}")
    public ResponseEntity<?> eliminarTurno(@PathVariable Long id) {
        try {
            if (!turnoReservaRepository.existsById(id)) {
                return new ResponseEntity<>("El turno indicado no existe", HttpStatus.BAD_REQUEST);
            }
            if (reservaRepository.countByTurnoId(id) > 0) {
                return new ResponseEntity<>("No se puede eliminar un turno con reservas asociadas", HttpStatus.CONFLICT);
            }
            turnoReservaRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/empleados")
    public ResponseEntity<List<Empleado>> listarEmpleados() {
        return new ResponseEntity<>(empleadoRepository.findAllByOrderByIdAsc(), HttpStatus.OK);
    }

    @PostMapping("/empleados")
    public ResponseEntity<?> crearEmpleado(@RequestBody Empleado empleado) {
        if (empleado.getNombre() == null || empleado.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (empleado.getApellido() == null || empleado.getApellido().trim().isEmpty()) {
            return new ResponseEntity<>("El apellido es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (empleado.getDni() == null || empleado.getDni().trim().isEmpty()) {
            return new ResponseEntity<>("El DNI es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (empleado.getHorasSemanales() == null || empleado.getHorasSemanales() < 0) {
            return new ResponseEntity<>("Las horas semanales no pueden ser negativas", HttpStatus.BAD_REQUEST);
        }
        if (empleado.getHorasMensuales() == null || empleado.getHorasMensuales() < 0) {
            return new ResponseEntity<>("Las horas mensuales no pueden ser negativas", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(empleadoRepository.save(empleado), HttpStatus.CREATED);
    }

    @PutMapping("/empleados/{id}")
    public ResponseEntity<?> actualizarEmpleado(@PathVariable Long id, @RequestBody Empleado empleado) {
        try {
            if (empleado.getNombre() == null || empleado.getNombre().trim().isEmpty()) {
                return new ResponseEntity<>("El nombre es obligatorio", HttpStatus.BAD_REQUEST);
            }
            if (empleado.getApellido() == null || empleado.getApellido().trim().isEmpty()) {
                return new ResponseEntity<>("El apellido es obligatorio", HttpStatus.BAD_REQUEST);
            }
            if (empleado.getDni() == null || empleado.getDni().trim().isEmpty()) {
                return new ResponseEntity<>("El DNI es obligatorio", HttpStatus.BAD_REQUEST);
            }
            if (empleado.getHorasSemanales() == null || empleado.getHorasSemanales() < 0) {
                return new ResponseEntity<>("Las horas semanales no pueden ser negativas", HttpStatus.BAD_REQUEST);
            }
            if (empleado.getHorasMensuales() == null || empleado.getHorasMensuales() < 0) {
                return new ResponseEntity<>("Las horas mensuales no pueden ser negativas", HttpStatus.BAD_REQUEST);
            }

            Empleado existente = empleadoRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("El empleado indicado no existe"));

            empleadoRepository.findByDni(empleado.getDni().trim())
                    .ifPresent(otroEmpleado -> {
                        if (!otroEmpleado.getId().equals(id)) {
                            throw new IllegalStateException("Ya existe otro empleado con ese DNI");
                        }
                    });

            existente.setNombre(empleado.getNombre().trim());
            existente.setApellido(empleado.getApellido().trim());
            existente.setNumeroTelefono(empleado.getNumeroTelefono() == null ? null : empleado.getNumeroTelefono().trim());
            existente.setDni(empleado.getDni().trim());
            existente.setHorasSemanales(empleado.getHorasSemanales());
            existente.setHorasMensuales(empleado.getHorasMensuales());
            return new ResponseEntity<>(empleadoRepository.save(existente), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/empleados/{id}")
    public ResponseEntity<?> eliminarEmpleado(@PathVariable Long id) {
        try {
            if (!empleadoRepository.existsById(id)) {
                return new ResponseEntity<>("El empleado indicado no existe", HttpStatus.BAD_REQUEST);
            }
            empleadoRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/stock")
    public ResponseEntity<List<ProductoStock>> listarStock() {
        return new ResponseEntity<>(productoStockRepository.findAllByOrderByCategoriaNombreAscNombreAsc(), HttpStatus.OK);
    }

    @GetMapping("/stock/categorias")
    public ResponseEntity<Map<String, List<ProductoStock>>> listarStockPorCategorias() {
        Map<String, List<ProductoStock>> stockPorCategorias = productoStockRepository.findAllByOrderByIdAsc()
                .stream()
                .collect(Collectors.groupingBy(
                        productoStock -> productoStock.getCategoria().getNombre(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return new ResponseEntity<>(stockPorCategorias, HttpStatus.OK);
    }

    @PostMapping("/stock")
    public ResponseEntity<?> crearProductoStock(@RequestBody CrearProductoStockRequest productoStock) {
        try {
            return new ResponseEntity<>(stockService.crearProducto(productoStock), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/stock/{id}")
    public ResponseEntity<?> actualizarProductoStock(@PathVariable Long id,
                                                     @RequestBody CrearProductoStockRequest productoStock) {
        try {
            return new ResponseEntity<>(stockService.actualizarProducto(id, productoStock), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/stock/{id}")
    public ResponseEntity<?> eliminarProductoStock(@PathVariable Long id) {
        try {
            stockService.eliminarProducto(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
