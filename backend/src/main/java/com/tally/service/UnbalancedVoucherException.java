package com.tally.service;

/** Raised when a voucher's debits do not equal its credits. */
public class UnbalancedVoucherException extends RuntimeException {
    public UnbalancedVoucherException(String message) {
        super(message);
    }
}
