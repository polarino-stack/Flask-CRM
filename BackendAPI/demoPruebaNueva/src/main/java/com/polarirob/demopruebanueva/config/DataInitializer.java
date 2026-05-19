package com.polarirob.demopruebanueva.config;

import com.polarirob.demopruebanueva.model.Mesa;
import com.polarirob.demopruebanueva.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MesaRepository mesaRepository;

    @Override
    public void run(String... args) {
        if (mesaRepository.count() == 0) {
            mesaRepository.save(new Mesa(1, 4));
            mesaRepository.save(new Mesa(2, 2));
            mesaRepository.save(new Mesa(3, 6));
            mesaRepository.save(new Mesa(4, 4));
            mesaRepository.save(new Mesa(5, 8));
            System.out.println("✅ 5 mesas de ejemplo guardadas en MySQL.");
        }
    }
}