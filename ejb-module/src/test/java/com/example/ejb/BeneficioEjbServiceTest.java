package com.example.ejb;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.lang.reflect.Field;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BeneficioEjbServiceTest {

    private BeneficioEjbService service;
    private EntityManager em;

    @BeforeEach
    void setUp() throws Exception {
        service = new BeneficioEjbService();
        em = mock(EntityManager.class);

        Field emField = BeneficioEjbService.class.getDeclaredField("em");
        emField.setAccessible(true);
        emField.set(service, em);
    }

    @Test
    void transfer_quandoValorNuloOuNaoPositivo_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> service.transfer(1L, 2L, null));
        assertThrows(IllegalArgumentException.class, () -> service.transfer(1L, 2L, BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () -> service.transfer(1L, 2L, BigDecimal.valueOf(-1)));
        verifyNoInteractions(em);
    }

    @Test
    void transfer_quandoIdsInvalidos_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> service.transfer(null, 2L, BigDecimal.ONE));
        assertThrows(IllegalArgumentException.class, () -> service.transfer(1L, null, BigDecimal.ONE));
        assertThrows(IllegalArgumentException.class, () -> service.transfer(1L, 1L, BigDecimal.ONE));
        verifyNoInteractions(em);
    }

    @Test
    void transfer_deveBloquearEmOrdemConsistenteETransferirValores() {
        Beneficio low = beneficio(10L, "Low", BigDecimal.valueOf(300));
        Beneficio high = beneficio(20L, "High", BigDecimal.valueOf(500));

        when(em.find(Beneficio.class, 10L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(low);
        when(em.find(Beneficio.class, 20L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(high);

        service.transfer(20L, 10L, BigDecimal.valueOf(200));

        InOrder inOrder = inOrder(em);
        inOrder.verify(em).find(Beneficio.class, 10L, LockModeType.PESSIMISTIC_WRITE);
        inOrder.verify(em).find(Beneficio.class, 20L, LockModeType.PESSIMISTIC_WRITE);

        assertEquals(BigDecimal.valueOf(500), low.getValor());
        assertEquals(BigDecimal.valueOf(300), high.getValor());
    }

    @Test
    void transfer_quandoSaldoInsuficiente_deveLancarIllegalState() {
        Beneficio low = beneficio(1L, "A", BigDecimal.valueOf(50));
        Beneficio high = beneficio(2L, "B", BigDecimal.valueOf(10));

        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(low);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(high);

        assertThrows(IllegalStateException.class,
                () -> service.transfer(1L, 2L, BigDecimal.valueOf(100)));
    }

    @Test
    void transfer_quandoOrigemNaoEncontrada_deveLancarIllegalArgument() {
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE))
                .thenReturn(beneficio(2L, "B", BigDecimal.TEN));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.transfer(1L, 2L, BigDecimal.ONE));

        assertTrue(ex.getMessage().contains("origem não encontrado"));
    }

    @Test
    void transfer_quandoDestinoNaoEncontrado_deveLancarIllegalArgument() {
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE))
                .thenReturn(beneficio(1L, "A", BigDecimal.TEN));
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.transfer(1L, 2L, BigDecimal.ONE));

        assertTrue(ex.getMessage().contains("destino não encontrado"));
    }

    private Beneficio beneficio(Long id, String nome, BigDecimal valor) {
        Beneficio b = new Beneficio();
        b.setId(id);
        b.setNome(nome);
        b.setValor(valor);
        b.setAtivo(true);
        return b;
    }
}
