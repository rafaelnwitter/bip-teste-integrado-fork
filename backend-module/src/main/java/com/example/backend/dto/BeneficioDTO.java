package com.example.backend.dto;

import com.example.ejb.Beneficio;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Schema(description = "DTO de representação de um Benefício")
public record BeneficioDTO(
    @Schema(description = "ID único do benefício", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    Long id,

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    @Schema(description = "Nome do benefício", example = "Vale Alimentação", requiredMode = Schema.RequiredMode.REQUIRED)
    String nome,

    @Size(max = 255)
    @Schema(description = "Descrição detalhada do benefício", example = "Benefício de vale alimentação mensal")
    String descricao,

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser maior que zero")
    @Schema(description = "Valor monetário do benefício", example = "1500.00", requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal valor,

    @Schema(description = "Indica se o benefício está ativo", example = "true", defaultValue = "true")
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
