package com.tally.entity;

/** The kinds of transaction the MVP records. */
public enum VoucherType {
    PAYMENT,
    RECEIPT,
    CONTRA,
    JOURNAL,
    SALES,
    PURCHASE
}
