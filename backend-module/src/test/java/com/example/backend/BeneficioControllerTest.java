package com.example.backend;

import com.example.ejb.Beneficio;
import com.example.backend.repository.BeneficioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BeneficioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BeneficioRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();

        Beneficio b = new Beneficio();
        b.setNome("Beneficio Teste");
        b.setDescricao("Descricao Teste");
        b.setValor(BigDecimal.valueOf(1000.00));
        b.setAtivo(true);
        repository.save(b);
    }

    @Test
    void deveListarBeneficios() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Beneficio Teste"))
                .andExpect(jsonPath("$[0].valor").value(1000.00));
    }

    @Test
    void deveBuscarPorId() throws Exception {
        Long id = repository.findAll().get(0).getId();

        mockMvc.perform(get("/api/v1/beneficios/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Beneficio Teste"));
    }

    @Test
    void deveCriarBeneficio() throws Exception {
        String json = """
                {
                    "nome": "Novo Beneficio",
                    "descricao": "Nova Descricao",
                    "valor": 500.00,
                    "ativo": true
                }
                """;

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Novo Beneficio"))
                .andExpect(jsonPath("$.valor").value(500.00));
    }

    @Test
    void deveAtualizarBeneficio() throws Exception {
        Long id = repository.findAll().get(0).getId();

        String json = """
                {
                    "nome": "Beneficio Atualizado",
                    "descricao": "Descricao Atualizada",
                    "valor": 1500.00,
                    "ativo": true
                }
                """;

        mockMvc.perform(put("/api/v1/beneficios/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Beneficio Atualizado"))
                .andExpect(jsonPath("$.valor").value(1500.00));
    }

    @Test
    void deveDeletarBeneficio() throws Exception {
        Long id = repository.findAll().get(0).getId();

        mockMvc.perform(delete("/api/v1/beneficios/" + id))
                .andExpect(status().isNoContent());

        // confirma soft delete — ativo = false
        mockMvc.perform(get("/api/v1/beneficios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void deveRetornar400QuandoNomeVazio() throws Exception {
        String json = """
                {
                    "nome": "",
                    "valor": 500.00
                }
                """;

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.nome").exists());
    }

    @Test
    void deveRetornar404QuandoNaoEncontrado() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios/999"))
                .andExpect(status().isNotFound());
    }

    // --- Testes de Transferência ---

    @Test
    void deveTransferirComSucesso() throws Exception {
        Beneficio b2 = new Beneficio();
        b2.setNome("Beneficio Destino");
        b2.setDescricao("Destino");
        b2.setValor(BigDecimal.valueOf(200.00));
        b2.setAtivo(true);
        repository.save(b2);

        List<Beneficio> all = repository.findAll();
        Long fromId = all.get(0).getId();
        Long toId = all.get(1).getId();

        String json = """
                {
                    "fromId": %d,
                    "toId": %d,
                    "valor": 300.00
                }
                """.formatted(fromId, toId);

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        // Verifica saldos após transferência
        mockMvc.perform(get("/api/v1/beneficios/" + fromId))
                .andExpect(jsonPath("$.valor").value(700.00));

        mockMvc.perform(get("/api/v1/beneficios/" + toId))
                .andExpect(jsonPath("$.valor").value(500.00));
    }

    @Test
    void deveRetornar422QuandoSaldoInsuficiente() throws Exception {
        Beneficio b2 = new Beneficio();
        b2.setNome("Beneficio Destino");
        b2.setDescricao("Destino");
        b2.setValor(BigDecimal.valueOf(100.00));
        b2.setAtivo(true);
        repository.save(b2);

        List<Beneficio> all = repository.findAll();
        Long fromId = all.get(0).getId();
        Long toId = all.get(1).getId();

        String json = """
                {
                    "fromId": %d,
                    "toId": %d,
                    "valor": 5000.00
                }
                """.formatted(fromId, toId);

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.erro").exists());
    }

    @Test
    void deveRetornar400QuandoIdsIguais() throws Exception {
        Long id = repository.findAll().get(0).getId();

        String json = """
                {
                    "fromId": %d,
                    "toId": %d,
                    "valor": 100.00
                }
                """.formatted(id, id);

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").exists());
    }

    @Test
    void deveRetornar400QuandoValorTransferenciaNegativo() throws Exception {
        String json = """
                {
                    "fromId": 1,
                    "toId": 2,
                    "valor": -50.00
                }
                """;

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar404QuandoBeneficioOrigemNaoExiste() throws Exception {
        Long toId = repository.findAll().get(0).getId();

        String json = """
                {
                    "fromId": 9999,
                    "toId": %d,
                    "valor": 100.00
                }
                """.formatted(toId);

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }
}
