package com.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.ejb.TransactionAttribute;
import jakarta.ejb.TransactionAttributeType;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Stateless
public class BeneficioEjbService {

    @PersistenceContext
    private EntityManager em;

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser positivo");
        }

        Beneficio from = em.find(Beneficio.class, fromId, LockModeType.PESSIMISTIC_WRITE);
        Beneficio to   = em.find(Beneficio.class, toId,   LockModeType.PESSIMISTIC_WRITE);

        if (from == null) throw new IllegalArgumentException("Beneficio origem não encontrado: " + fromId);
        if (to == null)   throw new IllegalArgumentException("Beneficio destino não encontrado: " + toId);

        if (from.getValor().compareTo(amount) < 0) {
            throw new IllegalStateException("Saldo insuficiente: " + fromId);
        }

        from.setValor(from.getValor().subtract(amount));
        to.setValor(to.getValor().add(amount));
        // dirty checking — em.merge() não necessário em entidades managed
    }
}
