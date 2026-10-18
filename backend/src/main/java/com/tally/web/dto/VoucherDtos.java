package com.tally.web.dto;

import com.tally.entity.VoucherType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Request and response shapes for vouchers, kept together for readability. */
public final class VoucherDtos {

    private VoucherDtos() {
    }

    public record CreateVoucherRequest(
            @NotNull VoucherType voucherType,
            @NotNull LocalDate date,
            @NotBlank String voucherNumber,
            String narration,
            @NotNull @Size(min = 2, message = "A voucher needs at least two lines")
            @Valid List<EntryLine> entries
    ) {
    }

    public record EntryLine(
            @NotNull Long ledgerId,
            @NotNull @DecimalMin("0.00") BigDecimal debit,
            @NotNull @DecimalMin("0.00") BigDecimal credit
    ) {
    }

    public record VoucherResponse(
            Long id,
            VoucherType voucherType,
            LocalDate date,
            String voucherNumber,
            String narration,
            BigDecimal total,
            List<EntryResponse> entries
    ) {
    }

    public record EntryResponse(
            Long ledgerId,
            String ledgerName,
            BigDecimal debit,
            BigDecimal credit
    ) {
    }
}
