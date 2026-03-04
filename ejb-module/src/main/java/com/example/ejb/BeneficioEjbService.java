package com.example.ejb;

import jakarta.persistence.*;
import java.math.BigDecimal;

public class BeneficioEjbService {

    @PersistenceContext
    private EntityManager em;

    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser positivo");
        }

        if (fromId == null || toId == null) {
            throw new IllegalArgumentException("IDs devem ser informados");
        }

        if (fromId.equals(toId)) {
            throw new IllegalArgumentException("IDs de origem e destino não podem ser iguais");
        }

        // Lock in a consistent order (lower id first) to avoid deadlocks
        // in concurrent opposite transfers (A->B and B->A).
        Long lowerId = fromId.compareTo(toId) < 0 ? fromId : toId;
        Long higherId = fromId.compareTo(toId) < 0 ? toId : fromId;

        Beneficio lower = em.find(Beneficio.class, lowerId, LockModeType.PESSIMISTIC_WRITE);
        Beneficio higher = em.find(Beneficio.class, higherId, LockModeType.PESSIMISTIC_WRITE);

        Beneficio from = fromId.equals(lowerId) ? lower : higher;
        Beneficio to = toId.equals(lowerId) ? lower : higher;

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
