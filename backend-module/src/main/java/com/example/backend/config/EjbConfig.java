package com.example.backend.config;

import com.example.ejb.BeneficioEjbService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração Spring que registra o BeneficioEjbService (EJB)
 * como um bean gerenciado pelo Spring.
 *
 * O Spring processa a anotação @PersistenceContext do EJB,
 * injetando o EntityManager automaticamente.
 */
@Configuration
public class EjbConfig {

    @Bean
    public BeneficioEjbService beneficioEjbService() {
        return new BeneficioEjbService();
    }
}
