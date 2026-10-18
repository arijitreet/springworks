package com.tally.repository;

import com.tally.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    List<StockItem> findAllByOrderBySizeMlDesc();
}
