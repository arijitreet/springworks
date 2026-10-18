package com.tally.web;

import com.tally.service.StockService;
import com.tally.web.dto.StockDtos.CreateMovementRequest;
import com.tally.web.dto.StockDtos.MovementView;
import com.tally.web.dto.StockDtos.StockLevelView;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    /** On-hand, produced and sold per bottle size — drives the dashboard. */
    @GetMapping("/levels")
    public List<StockLevelView> levels() {
        return service.levels();
    }

    @GetMapping("/movements")
    public List<MovementView> movements() {
        return service.recent();
    }

    @PostMapping("/movements")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementView record(@Valid @RequestBody CreateMovementRequest request) {
        return service.record(request);
    }
}
