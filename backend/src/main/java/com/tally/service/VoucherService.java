package com.tally.service;

import com.tally.entity.Ledger;
import com.tally.entity.Voucher;
import com.tally.entity.VoucherEntry;
import com.tally.repository.LedgerRepository;
import com.tally.repository.VoucherRepository;
import com.tally.web.dto.VoucherDtos.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository vouchers;
    private final LedgerRepository ledgers;

    public VoucherService(VoucherRepository vouchers, LedgerRepository ledgers) {
        this.vouchers = vouchers;
        this.ledgers = ledgers;
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> dayBook() {
        return vouchers.findAllByOrderByDateDescIdDesc().stream()
                .map(VoucherService::toResponse)
                .toList();
    }

    @Transactional
    public VoucherResponse create(CreateVoucherRequest req) {
        BigDecimal totalDebit = sum(req.entries(), EntryLine::debit);
        BigDecimal totalCredit = sum(req.entries(), EntryLine::credit);

        // The core rule, checked here so the caller gets a clear message.
        // The database also enforces it as a last line of defence.
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new UnbalancedVoucherException(
                    "Debits (" + totalDebit + ") must equal credits (" + totalCredit + ")");
        }
        if (totalDebit.signum() == 0) {
            throw new UnbalancedVoucherException("A voucher must move a non-zero amount");
        }
        for (EntryLine line : req.entries()) {
            if (line.debit().signum() > 0 && line.credit().signum() > 0) {
                throw new UnbalancedVoucherException(
                        "Each line is either a debit or a credit, not both");
            }
        }

        Map<Long, Ledger> ledgerById = loadLedgers(req.entries());

        Voucher voucher = new Voucher();
        voucher.setVoucherType(req.voucherType());
        voucher.setDate(req.date());
        voucher.setVoucherNumber(req.voucherNumber());
        voucher.setNarration(req.narration());

        for (EntryLine line : req.entries()) {
            VoucherEntry entry = new VoucherEntry();
            entry.setLedger(ledgerById.get(line.ledgerId()));
            entry.setDebit(line.debit());
            entry.setCredit(line.credit());
            voucher.addEntry(entry);
        }

        return toResponse(vouchers.save(voucher));
    }

    private Map<Long, Ledger> loadLedgers(List<EntryLine> entries) {
        List<Long> ids = entries.stream().map(EntryLine::ledgerId).distinct().toList();
        Map<Long, Ledger> byId = ledgers.findAllById(ids).stream()
                .collect(Collectors.toMap(Ledger::getId, Function.identity()));
        for (Long id : ids) {
            if (!byId.containsKey(id)) {
                throw new EntityNotFoundException("No ledger with id " + id);
            }
        }
        return byId;
    }

    private static BigDecimal sum(List<EntryLine> entries, Function<EntryLine, BigDecimal> field) {
        return entries.stream().map(field).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static VoucherResponse toResponse(Voucher v) {
        List<EntryResponse> lines = v.getEntries().stream()
                .map(e -> new EntryResponse(
                        e.getLedger().getId(),
                        e.getLedger().getName(),
                        e.getDebit(),
                        e.getCredit()))
                .toList();
        BigDecimal total = v.getEntries().stream()
                .map(VoucherEntry::getDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new VoucherResponse(
                v.getId(), v.getVoucherType(), v.getDate(),
                v.getVoucherNumber(), v.getNarration(), total, lines);
    }
}
