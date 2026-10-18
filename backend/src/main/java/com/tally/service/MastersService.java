package com.tally.service;

import com.tally.entity.Group;
import com.tally.entity.Ledger;
import com.tally.entity.StockItem;
import com.tally.repository.GroupRepository;
import com.tally.repository.LedgerRepository;
import com.tally.repository.StockItemRepository;
import com.tally.web.dto.MasterDtos.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MastersService {

    private final GroupRepository groups;
    private final LedgerRepository ledgers;
    private final StockItemRepository stockItems;

    public MastersService(GroupRepository groups, LedgerRepository ledgers,
                          StockItemRepository stockItems) {
        this.groups = groups;
        this.ledgers = ledgers;
        this.stockItems = stockItems;
    }

    // --- groups ---
    @Transactional(readOnly = true)
    public List<GroupView> listGroups() {
        return groups.findAll().stream().map(MastersService::toGroupView).toList();
    }

    @Transactional
    public GroupView createGroup(CreateGroupRequest req) {
        Group g = new Group();
        g.setName(req.name().trim());
        g.setNature(req.nature());
        if (req.parentId() != null) {
            g.setParent(groups.findById(req.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("No group " + req.parentId())));
        }
        return toGroupView(groups.save(g));
    }

    @Transactional
    public void deleteGroup(Long id) {
        groups.delete(groups.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No group " + id)));
    }

    // --- ledgers ---
    @Transactional(readOnly = true)
    public List<LedgerView> listLedgers() {
        return ledgers.findAllByOrderByNameAsc().stream().map(MastersService::toLedgerView).toList();
    }

    @Transactional
    public LedgerView createLedger(CreateLedgerRequest req) {
        Group group = groups.findById(req.groupId())
                .orElseThrow(() -> new EntityNotFoundException("No group " + req.groupId()));
        Ledger l = new Ledger();
        l.setName(req.name().trim());
        l.setGroup(group);
        l.setOpeningBalance(req.openingBalance() == null ? BigDecimal.ZERO : req.openingBalance());
        return toLedgerView(ledgers.save(l));
    }

    @Transactional
    public void deleteLedger(Long id) {
        ledgers.delete(ledgers.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No ledger " + id)));
    }

    // --- stock items ---
    @Transactional(readOnly = true)
    public List<StockItemView> listStockItems() {
        return stockItems.findAllByOrderBySizeMlDesc().stream()
                .map(MastersService::toStockItemView).toList();
    }

    @Transactional
    public StockItemView createStockItem(CreateStockItemRequest req) {
        StockItem s = new StockItem();
        s.setName(req.name().trim());
        s.setSizeMl(req.sizeMl());
        s.setUnit(req.unit() == null || req.unit().isBlank() ? "bottle" : req.unit().trim());
        return toStockItemView(stockItems.save(s));
    }

    @Transactional
    public void deleteStockItem(Long id) {
        stockItems.delete(stockItems.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No stock item " + id)));
    }

    // --- mappers ---
    private static GroupView toGroupView(Group g) {
        return new GroupView(g.getId(), g.getName(), g.getNature().name(),
                g.getParent() == null ? null : g.getParent().getId());
    }

    private static LedgerView toLedgerView(Ledger l) {
        return new LedgerView(l.getId(), l.getName(), l.getGroup().getId(),
                l.getGroup().getName(), l.getOpeningBalance());
    }

    private static StockItemView toStockItemView(StockItem s) {
        return new StockItemView(s.getId(), s.getName(), s.getSizeMl(), s.getUnit());
    }
}
