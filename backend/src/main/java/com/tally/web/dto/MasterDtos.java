package com.tally.web.dto;

import com.tally.entity.AccountNature;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** Request and response shapes for the masters (groups, ledgers, stock items). */
public final class MasterDtos {

    private MasterDtos() {
    }

    // --- responses ---
    public record GroupView(Long id, String name, String nature, Long parentId) {
    }

    public record LedgerView(Long id, String name, Long groupId, String groupName,
                             BigDecimal openingBalance) {
    }

    public record StockItemView(Long id, String name, Integer sizeMl, String unit) {
    }

    // --- requests ---
    public record CreateGroupRequest(
            @NotBlank String name,
            @NotNull AccountNature nature,
            Long parentId
    ) {
    }

    public record CreateLedgerRequest(
            @NotBlank String name,
            @NotNull Long groupId,
            BigDecimal openingBalance
    ) {
    }

    public record CreateStockItemRequest(
            @NotBlank String name,
            @NotNull @Positive Integer sizeMl,
            String unit
    ) {
    }
}
