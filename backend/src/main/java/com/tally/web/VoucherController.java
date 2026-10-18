package com.tally.web;

import com.tally.service.VoucherService;
import com.tally.web.dto.VoucherDtos.CreateVoucherRequest;
import com.tally.web.dto.VoucherDtos.VoucherResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService service;

    public VoucherController(VoucherService service) {
        this.service = service;
    }

    /** Day Book: every voucher, newest first. */
    @GetMapping
    public List<VoucherResponse> dayBook() {
        return service.dayBook();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VoucherResponse create(@Valid @RequestBody CreateVoucherRequest request) {
        return service.create(request);
    }
}
