package com.tally.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** A finished good — one per bottle size. */
@Entity
@Table(name = "stock_items")
@Getter
@Setter
public class StockItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "size_ml", nullable = false)
    private Integer sizeMl;

    @Column(nullable = false)
    private String unit = "bottle";
}
