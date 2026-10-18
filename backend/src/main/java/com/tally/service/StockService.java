package com.tally.service;

import com.tally.entity.MovementDirection;
import com.tally.entity.StockItem;
import com.tally.entity.StockMovement;
import com.tally.repository.StockItemRepository;
import com.tally.repository.StockMovementRepository;
import com.tally.web.dto.StockDtos.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StockService {

    private final StockItemRepository items;
    private final StockMovementRepository movements;

    public StockService(StockItemRepository items, StockMovementRepository movements) {
        this.items = items;
        this.movements = movements;
    }

    /** On-hand, produced and sold totals for every stock item (one row per bottle size). */
    @Transactional(readOnly = true)
    public List<StockLevelView> levels() {
        Map<Long, BigDecimal> onHand = new HashMap<>();
        for (var row : movements.onHandByItem()) {
            onHand.put(row.getStockItemId(), row.getOnHand());
        }

        Map<Long, BigDecimal> produced = new HashMap<>();
        Map<Long, BigDecimal> sold = new HashMap<>();
        for (StockMovement m : movements.findAll()) {
            Long itemId = m.getStockItem().getId();
            if (m.getDirection() == MovementDirection.IN) {
                produced.merge(itemId, m.getQuantity(), BigDecimal::add);
            } else {
                sold.merge(itemId, m.getQuantity(), BigDecimal::add);
            }
        }

        return items.findAllByOrderBySizeMlDesc().stream()
                .map(i -> new StockLevelView(
                        i.getId(), i.getName(), i.getSizeMl(), i.getUnit(),
                        onHand.getOrDefault(i.getId(), BigDecimal.ZERO),
                        produced.getOrDefault(i.getId(), BigDecimal.ZERO),
                        sold.getOrDefault(i.getId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovementView> recent() {
        return movements.findAllByOrderByDateDescIdDesc().stream()
                .map(m -> new MovementView(
                        m.getId(), m.getStockItem().getId(), m.getStockItem().getName(),
                        m.getDate(), m.getDirection(), m.getQuantity(), m.getNote()))
                .toList();
    }

    @Transactional
    public MovementView record(CreateMovementRequest req) {
        StockItem item = items.findById(req.stockItemId())
                .orElseThrow(() -> new EntityNotFoundException("No stock item " + req.stockItemId()));

        StockMovement m = new StockMovement();
        m.setStockItem(item);
        m.setDate(req.date());
        m.setDirection(req.direction());
        m.setQuantity(req.quantity());
        m.setNote(req.note());
        movements.save(m);

        return new MovementView(m.getId(), item.getId(), item.getName(),
                m.getDate(), m.getDirection(), m.getQuantity(), m.getNote());
    }
}
