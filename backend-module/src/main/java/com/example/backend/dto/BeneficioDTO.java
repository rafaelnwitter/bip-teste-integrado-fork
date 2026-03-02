package com.example.backend.dto;

import com.example.backend.model.Beneficio;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record BeneficioDTO(
    Long id,

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    String nome,

    @Size(max = 255)
    String descricao,

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser maior que zero")
    BigDecimal valor,

    Boolean ativo
) {
    public static BeneficioDTO from(Beneficio b) {
        return new BeneficioDTO(
            b.getId(),
            b.getNome(),
            b.getDescricao(),
            b.getValor(),
            b.getAtivo()
        );
    }
}
