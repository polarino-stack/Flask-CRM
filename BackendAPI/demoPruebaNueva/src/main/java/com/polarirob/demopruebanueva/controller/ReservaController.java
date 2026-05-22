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
}
