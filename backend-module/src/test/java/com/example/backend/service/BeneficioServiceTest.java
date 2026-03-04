package com.example.backend.service;

import com.example.backend.dto.BeneficioDTO;
import com.example.backend.dto.TransferDTO;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.Beneficio;
import com.example.ejb.BeneficioEjbService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficioServiceTest {

    @Mock
    private BeneficioRepository repository;

    @Mock
    private BeneficioEjbService ejbService;

    @InjectMocks
    private BeneficioService service;

    private Beneficio beneficio;

    @BeforeEach
    void setUp() {
        beneficio = new Beneficio();
        beneficio.setId(1L);
        beneficio.setNome("Vale");
        beneficio.setDescricao("Desc");
        beneficio.setValor(BigDecimal.valueOf(1000));
        beneficio.setAtivo(true);
    }

    @Test
    void listarAtivos_deveMapearParaDto() {
        when(repository.findByAtivoTrue()).thenReturn(List.of(beneficio));

        List<BeneficioDTO> result = service.listarAtivos();

        assertEquals(1, result.size());
        assertEquals("Vale", result.get(0).nome());
        verify(repository).findByAtivoTrue();
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornarDto() {
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));

        BeneficioDTO result = service.buscarPorId(1L);

        assertEquals(1L, result.id());
        assertEquals("Vale", result.nome());
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancar404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.buscarPorId(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Beneficio não encontrado"));
    }

    @Test
    void criar_quandoAtivoNulo_deveAssumirTrue() {
        BeneficioDTO dto = new BeneficioDTO(null, "Novo", "Nova", BigDecimal.TEN, null);
        when(repository.save(any(Beneficio.class))).thenAnswer(invocation -> {
            Beneficio b = invocation.getArgument(0);
            b.setId(10L);
            return b;
        });

        BeneficioDTO result = service.criar(dto);

        assertEquals(10L, result.id());
        assertTrue(result.ativo());
    }

    @Test
    void atualizar_quandoExiste_devePersistirCampos() {
        BeneficioDTO dto = new BeneficioDTO(null, "Atualizado", "Desc2", BigDecimal.ONE, false);
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));
        when(repository.save(any(Beneficio.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BeneficioDTO result = service.atualizar(1L, dto);

        assertEquals("Atualizado", result.nome());
        assertEquals(BigDecimal.ONE, result.valor());
        assertFalse(result.ativo());
    }

    @Test
    void deletar_quandoExiste_deveFazerSoftDelete() {
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));

        service.deletar(1L);

        assertFalse(beneficio.getAtivo());
        verify(repository).save(beneficio);
    }

    @Test
    void transferir_quandoIdsIguais_deveLancarIllegalArgument() {
        TransferDTO dto = new TransferDTO(1L, 1L, BigDecimal.TEN);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.transferir(dto));

        assertTrue(ex.getMessage().contains("Origem e destino"));
        verifyNoInteractions(ejbService);
    }

    @Test
    void transferir_quandoNaoEncontradoNoEjb_deveTraduzirPara404() {
        TransferDTO dto = new TransferDTO(1L, 2L, BigDecimal.TEN);
        doThrow(new IllegalArgumentException("Beneficio origem não encontrado: 1"))
                .when(ejbService).transfer(1L, 2L, BigDecimal.TEN);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.transferir(dto));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("não encontrado"));
    }

    @Test
    void transferir_quandoValido_deveDelegarParaEjb() {
        TransferDTO dto = new TransferDTO(1L, 2L, BigDecimal.valueOf(50));

        service.transferir(dto);

        verify(ejbService).transfer(1L, 2L, BigDecimal.valueOf(50));
    }
}
