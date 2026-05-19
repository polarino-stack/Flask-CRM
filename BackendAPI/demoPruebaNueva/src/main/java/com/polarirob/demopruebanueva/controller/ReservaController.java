package com.polarirob.demopruebanueva.controller;

import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.model.Reserva;
import com.polarirob.demopruebanueva.repository.MesaRepository;
import com.polarirob.demopruebanueva.repository.ReservaRepository;
import com.polarirob.demopruebanueva.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ReservaController {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ReservaService reservaService;

    @GetMapping("/mesas")
    public ResponseEntity<List<Mesa>> listarMesas() {
        return new ResponseEntity<>(mesaRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/mesas")
    public ResponseEntity<Mesa> crearMesa(@RequestBody Mesa mesa) {
        return new ResponseEntity<>(mesaRepository.save(mesa), HttpStatus.CREATED);
    }

    @GetMapping("/reservas")
    public ResponseEntity<List<Reserva>> listarReservas() {
        return new ResponseEntity<>(reservaRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/reservas")
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva) {
        try {
            Reserva nueva = reservaService.crearReserva(reserva);
            return new ResponseEntity<>(nueva, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }
}