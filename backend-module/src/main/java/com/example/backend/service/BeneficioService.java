package com.example.backend.service;

import com.example.backend.dto.BeneficioDTO;
import com.example.backend.dto.TransferDTO;
import com.example.ejb.Beneficio;
import com.example.ejb.BeneficioEjbService;
import com.example.backend.repository.BeneficioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class BeneficioService {

    private final BeneficioRepository repository;
    private final BeneficioEjbService ejbService;

    public BeneficioService(BeneficioRepository repository, BeneficioEjbService ejbService) {
        this.repository = repository;
        this.ejbService = ejbService;
    }

    @Transactional(readOnly = true)
    public List<BeneficioDTO> listarAtivos() {
        return repository.findByAtivoTrue()
                .stream()
                .map(BeneficioDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BeneficioDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(BeneficioDTO::from)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Beneficio não encontrado: " + id));
    }

    public BeneficioDTO criar(BeneficioDTO dto) {
        Beneficio novo = new Beneficio();
        novo.setNome(dto.nome());
        novo.setDescricao(dto.descricao());
        novo.setValor(dto.valor());
        novo.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        return BeneficioDTO.from(repository.save(novo));
    }

    public BeneficioDTO atualizar(Long id, BeneficioDTO dto) {
        Beneficio existente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Beneficio não encontrado: " + id));
        existente.setNome(dto.nome());
        existente.setDescricao(dto.descricao());
        existente.setValor(dto.valor());
        existente.setAtivo(dto.ativo());
        return BeneficioDTO.from(repository.save(existente));
    }

    public void deletar(Long id) {
        Beneficio existente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Beneficio não encontrado: " + id));
        existente.setAtivo(false);
        repository.save(existente);
    }

    /**
     * Transferência de valor entre dois benefícios.
     * Delega ao BeneficioEjbService que implementa:
     * - Validação de valor positivo
     * - Lock pessimista (PESSIMISTIC_WRITE) para evitar race conditions
     * - Verificação de saldo suficiente
     * - Rollback automático via @Transactional em caso de exceção
     */
    public void transferir(TransferDTO dto) {
        if (dto.fromId().equals(dto.toId())) {
            throw new IllegalArgumentException("Origem e destino devem ser diferentes");
        }

        try {
            ejbService.transfer(dto.fromId(), dto.toId(), dto.valor());
        } catch (IllegalArgumentException ex) {
            // EJB lança IllegalArgumentException para "não encontrado" — traduz para 404
            if (ex.getMessage() != null && ex.getMessage().contains("não encontrado")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
            }
            throw ex;
        }
    }
}
