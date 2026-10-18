import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  type NewGroup,
  type NewLedger,
  type NewMovement,
  type NewStockItem,
  type NewVoucher,
} from "./api";
import {
  demoGroups,
  demoLedgers,
  demoLevels,
  demoMovements,
  demoStockItems,
  demoVouchers,
} from "./demo";
import type {
  Group,
  Ledger,
  Movement,
  StockItem,
  StockLevel,
  Voucher,
} from "./types";

type Source = "loading" | "live" | "sample";

interface PlantState {
  source: Source;
  levels: StockLevel[];
  movements: Movement[];
  vouchers: Voucher[];
  groups: Group[];
  ledgers: Ledger[];
  stockItems: StockItem[];
  refresh: () => void;
  recordMovement: (m: NewMovement) => Promise<void>;
  createVoucher: (v: NewVoucher) => Promise<void>;
  createGroup: (g: NewGroup) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  createLedger: (l: NewLedger) => Promise<void>;
  deleteLedger: (id: number) => Promise<void>;
  createStockItem: (s: NewStockItem) => Promise<void>;
  deleteStockItem: (id: number) => Promise<void>;
}

function nextId<T extends { id: number }>(rows: T[]) {
  return Math.max(0, ...rows.map((r) => r.id)) + 1;
}

const PlantContext = createContext<PlantState | null>(null);

export function PlantProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<Source>("loading");
  const [levels, setLevels] = useState<StockLevel[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const loadSample = useCallback(() => {
    setLevels(demoLevels);
    setMovements(demoMovements);
    setVouchers(demoVouchers);
    setGroups(demoGroups);
    setLedgers(demoLedgers);
    setStockItems(demoStockItems);
    setSource("sample");
  }, []);

  const load = useCallback(async () => {
    try {
      const [lv, mv, vo, gr, le, si] = await Promise.all([
        api.stockLevels(),
        api.movements(),
        api.vouchers(),
        api.groups(),
        api.ledgers(),
        api.stockItems(),
      ]);
      setLevels(lv);
      setMovements(mv);
      setVouchers(vo);
      setGroups(gr);
      setLedgers(le);
      setStockItems(si);
      setSource("live");
    } catch {
      // API not reachable yet — show sample data so the app stays legible.
      loadSample();
    }
  }, [loadSample]);

  useEffect(() => {
    load();
  }, [load]);

  const recordMovement = useCallback(
    async (m: NewMovement) => {
      if (source === "live") {
        await api.recordMovement(m);
        const [lv, mv] = await Promise.all([api.stockLevels(), api.movements()]);
        setLevels(lv);
        setMovements(mv);
        return;
      }
      // Sample mode: apply locally so the interface stays interactive.
      const item = stockItems.find((s) => s.id === m.stockItemId);
      if (!item) return;
      setMovements((prev) => [
        {
          id: Math.max(0, ...prev.map((x) => x.id)) + 1,
          stockItemId: item.id,
          stockItemName: item.name,
          date: m.date,
          direction: m.direction,
          quantity: m.quantity,
          note: m.note,
        },
        ...prev,
      ]);
      setLevels((prev) =>
        prev.map((l) =>
          l.stockItemId === m.stockItemId
            ? {
                ...l,
                onHand:
                  l.onHand + (m.direction === "IN" ? m.quantity : -m.quantity),
                producedTotal:
                  l.producedTotal + (m.direction === "IN" ? m.quantity : 0),
                soldTotal:
                  l.soldTotal + (m.direction === "OUT" ? m.quantity : 0),
              }
            : l,
        ),
      );
    },
    [source, stockItems],
  );

  const createVoucher = useCallback(
    async (v: NewVoucher) => {
      if (source === "live") {
        await api.createVoucher(v);
        setVouchers(await api.vouchers());
        return;
      }
      const total = v.entries.reduce((s, e) => s + e.debit, 0);
      setVouchers((prev) => [
        {
          id: Math.max(0, ...prev.map((x) => x.id)) + 1,
          voucherType: v.voucherType,
          date: v.date,
          voucherNumber: v.voucherNumber,
          narration: v.narration,
          total,
          entries: v.entries.map((e) => ({
            ...e,
            ledgerName: ledgers.find((l) => l.id === e.ledgerId)?.name ?? "—",
          })),
        },
        ...prev,
      ]);
    },
    [source, ledgers],
  );

  const reloadMasters = useCallback(async () => {
    const [gr, le, si, lv] = await Promise.all([
      api.groups(),
      api.ledgers(),
      api.stockItems(),
      api.stockLevels(),
    ]);
    setGroups(gr);
    setLedgers(le);
    setStockItems(si);
    setLevels(lv);
  }, []);

  const createGroup = useCallback(
    async (g: NewGroup) => {
      if (source === "live") {
        await api.createGroup(g);
        return reloadMasters();
      }
      setGroups((prev) => [
        ...prev,
        { id: nextId(prev), name: g.name, nature: g.nature, parentId: g.parentId ?? null },
      ]);
    },
    [source, reloadMasters],
  );

  const deleteGroup = useCallback(
    async (id: number) => {
      if (source === "live") {
        await api.deleteGroup(id);
        return reloadMasters();
      }
      setGroups((prev) => prev.filter((g) => g.id !== id));
    },
    [source, reloadMasters],
  );

  const createLedger = useCallback(
    async (l: NewLedger) => {
      if (source === "live") {
        await api.createLedger(l);
        return reloadMasters();
      }
      const group = groups.find((g) => g.id === l.groupId);
      setLedgers((prev) => [
        ...prev,
        {
          id: nextId(prev),
          name: l.name,
          groupId: l.groupId,
          groupName: group?.name ?? "—",
          openingBalance: l.openingBalance ?? 0,
        },
      ]);
    },
    [source, reloadMasters, groups],
  );

  const deleteLedger = useCallback(
    async (id: number) => {
      if (source === "live") {
        await api.deleteLedger(id);
        return reloadMasters();
      }
      setLedgers((prev) => prev.filter((l) => l.id !== id));
    },
    [source, reloadMasters],
  );

  const createStockItem = useCallback(
    async (s: NewStockItem) => {
      if (source === "live") {
        await api.createStockItem(s);
        return reloadMasters();
      }
      const id = nextId(stockItems);
      const unit = s.unit || "bottle";
      setStockItems((prev) => [...prev, { id, name: s.name, sizeMl: s.sizeMl, unit }]);
      setLevels((prev) => [
        ...prev,
        {
          stockItemId: id,
          name: s.name,
          sizeMl: s.sizeMl,
          unit,
          onHand: 0,
          producedTotal: 0,
          soldTotal: 0,
        },
      ]);
    },
    [source, reloadMasters, stockItems],
  );

  const deleteStockItem = useCallback(
    async (id: number) => {
      if (source === "live") {
        await api.deleteStockItem(id);
        return reloadMasters();
      }
      setStockItems((prev) => prev.filter((s) => s.id !== id));
      setLevels((prev) => prev.filter((l) => l.stockItemId !== id));
    },
    [source, reloadMasters],
  );

  const value = useMemo<PlantState>(
    () => ({
      source,
      levels,
      movements,
      vouchers,
      groups,
      ledgers,
      stockItems,
      refresh: load,
      recordMovement,
      createVoucher,
      createGroup,
      deleteGroup,
      createLedger,
      deleteLedger,
      createStockItem,
      deleteStockItem,
    }),
    [
      source,
      levels,
      movements,
      vouchers,
      groups,
      ledgers,
      stockItems,
      load,
      recordMovement,
      createVoucher,
      createGroup,
      deleteGroup,
      createLedger,
      deleteLedger,
      createStockItem,
      deleteStockItem,
    ],
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
}

export function usePlant() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error("usePlant must be used inside PlantProvider");
  return ctx;
}
