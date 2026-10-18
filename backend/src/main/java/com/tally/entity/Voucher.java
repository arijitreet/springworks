package com.tally.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** A transaction header. Owns two or more balanced entries. */
@Entity
@Table(name = "vouchers")
@Getter
@Setter
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false)
    private VoucherType voucherType;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "voucher_number", nullable = false)
    private String voucherNumber;

    @Column(columnDefinition = "text")
    private String narration;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VoucherEntry> entries = new ArrayList<>();

    public void addEntry(VoucherEntry entry) {
        entry.setVoucher(this);
        entries.add(entry);
    }
}
