package com.tally.repository;

import com.tally.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByDateDescIdDesc();

    /** On-hand quantity per stock item: produced (IN) minus sold (OUT). */
    @Query("""
            select m.stockItem.id as stockItemId,
                   coalesce(sum(case when m.direction = com.tally.entity.MovementDirection.IN
                                     then m.quantity else -m.quantity end), 0) as onHand
            from StockMovement m
            group by m.stockItem.id
            """)
    List<OnHandRow> onHandByItem();

    interface OnHandRow {
        Long getStockItemId();
        BigDecimal getOnHand();
    }
}
