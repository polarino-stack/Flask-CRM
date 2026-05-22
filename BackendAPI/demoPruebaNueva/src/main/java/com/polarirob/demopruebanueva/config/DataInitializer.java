package com.polarirob.demopruebanueva.config;

import com.polarirob.demopruebanueva.model.CategoriaStock;
import com.polarirob.demopruebanueva.model.Empleado;
import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.model.ProductoStock;
import com.polarirob.demopruebanueva.model.TurnoReserva;
import com.polarirob.demopruebanueva.repository.CategoriaStockRepository;
import com.polarirob.demopruebanueva.repository.EmpleadoRepository;
import com.polarirob.demopruebanueva.repository.MesaRepository;
import com.polarirob.demopruebanueva.repository.ProductoStockRepository;
import com.polarirob.demopruebanueva.repository.TurnoReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private CategoriaStockRepository categoriaStockRepository;

    @Autowired
    private ProductoStockRepository productoStockRepository;

    @Autowired
    private TurnoReservaRepository turnoReservaRepository;

    @Override
    public void run(String... args) {
        crearMesaSiNoExiste(1, 4);
        crearMesaSiNoExiste(2, 2);
        crearMesaSiNoExiste(3, 6);
        crearMesaSiNoExiste(4, 4);
        crearMesaSiNoExiste(5, 8);

        crearEmpleadoSiNoExiste("Ana", "Garcia", "600111222", "12345678A", 40, 160);
        crearEmpleadoSiNoExiste("Luis", "Martinez", "600222333", "23456789B", 35, 140);
        crearEmpleadoSiNoExiste("Marta", "Lopez", "600333444", "34567890C", 30, 120);
        crearEmpleadoSiNoExiste("Carlos", "Sanchez", "600444555", "45678901D", 40, 160);
        crearEmpleadoSiNoExiste("Lucia", "Fernandez", "600555666", "56789012E", 25, 100);
        crearEmpleadoSiNoExiste("Javier", "Ruiz", "600666777", "67890123F", 20, 80);

        crearTurnoSiNoExiste("Comida 1", LocalTime.of(13, 0), LocalTime.of(14, 30));
        crearTurnoSiNoExiste("Comida 2", LocalTime.of(14, 30), LocalTime.of(16, 0));
        crearTurnoSiNoExiste("Cena 1", LocalTime.of(20, 0), LocalTime.of(21, 30));
        crearTurnoSiNoExiste("Cena 2", LocalTime.of(21, 30), LocalTime.of(23, 0));

        crearProductoSiNoExiste("Bebida", "Coca cola", 48, "910111001");
        crearProductoSiNoExiste("Bebida", "Fanta de Naranja", 36, "910111002");
        crearProductoSiNoExiste("Bebida", "Fanta de limon", 34, "910111003");
        crearProductoSiNoExiste("Bebida", "Agua", 72, "910111004");
        crearProductoSiNoExiste("Bebida", "Nestea", 30, "910111005");
        crearProductoSiNoExiste("Bebida", "Nestea de Maracuya", 24, "910111006");
        crearProductoSiNoExiste("Bebida", "Tonica", 20, "910111007");

        crearProductoSiNoExiste("Bebidas Alcoholicas", "Ballantines", 8, "910222001");
        crearProductoSiNoExiste("Bebidas Alcoholicas", "Red Label", 7, "910222002");
        crearProductoSiNoExiste("Bebidas Alcoholicas", "Sigrams", 6, "910222003");
        crearProductoSiNoExiste("Bebidas Alcoholicas", "Puerto de Indias", 9, "910222004");
        crearProductoSiNoExiste("Bebidas Alcoholicas", "Barcelo", 5, "910222005");
        crearProductoSiNoExiste("Bebidas Alcoholicas", "Brugal", 6, "910222006");

        crearProductoSiNoExiste("Embutidos", "Queso", 12, "910333001");
        crearProductoSiNoExiste("Embutidos", "Jamon Serrano", 10, "910333002");
        crearProductoSiNoExiste("Embutidos", "Jamon Dulce", 9, "910333003");
        crearProductoSiNoExiste("Embutidos", "Fuet", 14, "910333004");
        crearProductoSiNoExiste("Embutidos", "Chorizo", 11, "910333005");

        crearProductoSiNoExiste("Condiments", "Sal", 20, "910444001");
        crearProductoSiNoExiste("Condiments", "Pimienta", 18, "910444002");
        crearProductoSiNoExiste("Condiments", "Tomillo", 15, "910444003");
        crearProductoSiNoExiste("Condiments", "Ajo en polvo", 16, "910444004");
        crearProductoSiNoExiste("Condiments", "Pimienton", 13, "910444005");

        crearProductoSiNoExiste("Frutas y vegetales", "Tomate", 40, "910555001");
        crearProductoSiNoExiste("Frutas y vegetales", "Patata", 55, "910555002");
        crearProductoSiNoExiste("Frutas y vegetales", "Platano", 35, "910555003");
        crearProductoSiNoExiste("Frutas y vegetales", "Lechuga", 22, "910555004");
        crearProductoSiNoExiste("Frutas y vegetales", "Coliflor", 16, "910555005");
        crearProductoSiNoExiste("Frutas y vegetales", "Blocoli", 18, "910555006");

        crearProductoSiNoExiste("Pescado", "Lubina", 12, "910666001");
        crearProductoSiNoExiste("Pescado", "Trucha", 10, "910666002");
        crearProductoSiNoExiste("Pescado", "Atun", 14, "910666003");
        crearProductoSiNoExiste("Pescado", "Salmon", 11, "910666004");

        crearProductoSiNoExiste("Carne", "Lomo", 18, "910777001");
        crearProductoSiNoExiste("Carne", "Pechuga", 24, "910777002");
        crearProductoSiNoExiste("Carne", "Entrecot", 10, "910777003");
        crearProductoSiNoExiste("Carne", "Pollo", 20, "910777004");
        crearProductoSiNoExiste("Carne", "Secteto", 9, "910777005");
        crearProductoSiNoExiste("Carne", "Bacon", 16, "910777006");
        crearProductoSiNoExiste("Carne", "Panceta", 14, "910777007");

        crearProductoSiNoExiste("Postres", "Yogurt Natural", 32, "910888001");
        crearProductoSiNoExiste("Postres", "Yogurt Sabores", 30, "910888002");
        crearProductoSiNoExiste("Postres", "Crema Catalana", 18, "910888003");
        crearProductoSiNoExiste("Postres", "Culan", 16, "910888004");
        crearProductoSiNoExiste("Postres", "Natilla", 22, "910888005");
        crearProductoSiNoExiste("Postres", "Helado", 25, "910888006");
    }

    private void crearMesaSiNoExiste(Integer numeroMesa, Integer capacidad) {
        mesaRepository.findByNumeroMesa(numeroMesa)
                .orElseGet(() -> mesaRepository.save(new Mesa(numeroMesa, capacidad)));
    }

    private void crearEmpleadoSiNoExiste(String nombre, String apellido, String numeroTelefono, String dni,
                                         Integer horasSemanales, Integer horasMensuales) {
        empleadoRepository.findByDni(dni)
                .orElseGet(() -> empleadoRepository.save(
                        new Empleado(nombre, apellido, numeroTelefono, dni, horasSemanales, horasMensuales)
                ));
    }

    private void crearTurnoSiNoExiste(String nombre, LocalTime horaInicio, LocalTime horaFin) {
        turnoReservaRepository.findByNombre(nombre)
                .orElseGet(() -> turnoReservaRepository.save(new TurnoReserva(nombre, horaInicio, horaFin)));
    }

    private void crearProductoSiNoExiste(String categoriaNombre, String nombre, Integer cantidad,
                                         String telefonoProveedor) {
        CategoriaStock categoria = categoriaStockRepository.findByNombre(categoriaNombre)
                .orElseGet(() -> categoriaStockRepository.save(new CategoriaStock(categoriaNombre)));

        productoStockRepository.findByCategoriaAndNombre(categoria, nombre)
                .orElseGet(() -> productoStockRepository.save(
                        new ProductoStock(categoria, nombre, cantidad, telefonoProveedor)
                ));
    }

}
