package com.tally.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** A node in the chart of accounts. Groups nest via parent to form the tree. */
@Entity
@Table(name = "groups")
@Getter
@Setter
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private Group parent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountNature nature;
}
