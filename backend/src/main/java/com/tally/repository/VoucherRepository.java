package com.tally.repository;

import com.tally.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findAllByOrderByDateDescIdDesc();
}
