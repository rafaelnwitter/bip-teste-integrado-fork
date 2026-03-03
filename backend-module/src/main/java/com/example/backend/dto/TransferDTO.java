package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransferDTO(
    @NotNull(message = "ID de origem é obrigatório")
    Long fromId,

    @NotNull(message = "ID de destino é obrigatório")
    Long toId,

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser maior que zero")
    BigDecimal valor
) {}
