package com.tally.web;

import com.tally.service.MastersService;
import com.tally.web.dto.MasterDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MastersController {

    private final MastersService service;

    public MastersController(MastersService service) {
        this.service = service;
    }

    // --- groups ---
    @GetMapping("/groups")
    public List<GroupView> groups() {
        return service.listGroups();
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupView createGroup(@Valid @RequestBody CreateGroupRequest req) {
        return service.createGroup(req);
    }

    @DeleteMapping("/groups/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(@PathVariable Long id) {
        service.deleteGroup(id);
    }

    // --- ledgers ---
    @GetMapping("/ledgers")
    public List<LedgerView> ledgers() {
        return service.listLedgers();
    }

    @PostMapping("/ledgers")
    @ResponseStatus(HttpStatus.CREATED)
    public LedgerView createLedger(@Valid @RequestBody CreateLedgerRequest req) {
        return service.createLedger(req);
    }

    @DeleteMapping("/ledgers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLedger(@PathVariable Long id) {
        service.deleteLedger(id);
    }

    // --- stock items ---
    @GetMapping("/stock-items")
    public List<StockItemView> stockItems() {
        return service.listStockItems();
    }

    @PostMapping("/stock-items")
    @ResponseStatus(HttpStatus.CREATED)
    public StockItemView createStockItem(@Valid @RequestBody CreateStockItemRequest req) {
        return service.createStockItem(req);
    }

    @DeleteMapping("/stock-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStockItem(@PathVariable Long id) {
        service.deleteStockItem(id);
    }
}
