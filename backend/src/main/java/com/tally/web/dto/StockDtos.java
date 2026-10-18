package com.tally.web.dto;

import com.tally.entity.MovementDirection;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class StockDtos {

    private StockDtos() {
    }

    public record StockLevelView(
            Long stockItemId,
            String name,
            Integer sizeMl,
            String unit,
            BigDecimal onHand,
            BigDecimal producedTotal,
            BigDecimal soldTotal
    ) {
    }

    public record MovementView(
            Long id,
            Long stockItemId,
            String stockItemName,
            LocalDate date,
            MovementDirection direction,
            BigDecimal quantity,
            String note
    ) {
    }

    public record CreateMovementRequest(
            @NotNull Long stockItemId,
            @NotNull LocalDate date,
            @NotNull MovementDirection direction,
            @NotNull @DecimalMin(value = "0.001", message = "Quantity must be positive") BigDecimal quantity,
            String note
    ) {
    }
}
