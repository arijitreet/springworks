import type {
  Group,
  Ledger,
  Movement,
  StockItem,
  StockLevel,
  Voucher,
} from "./types";

// Where the Spring Boot API lives.
// Dev: leave VITE_API_URL unset — calls go to same-origin /api, which the Vite
// dev server proxies to the backend (see vite.config.ts).
// Production: set VITE_API_URL in Vercel to your Render URL.
const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.title ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export interface NewMovement {
  stockItemId: number;
  date: string;
  direction: "IN" | "OUT";
  quantity: number;
  note?: string;
}

export interface NewVoucher {
  voucherType: Voucher["voucherType"];
  date: string;
  voucherNumber: string;
  narration?: string;
  entries: { ledgerId: number; debit: number; credit: number }[];
}

export interface NewGroup {
  name: string;
  nature: Group["nature"];
  parentId?: number | null;
}
export interface NewLedger {
  name: string;
  groupId: number;
  openingBalance?: number;
}
export interface NewStockItem {
  name: string;
  sizeMl: number;
  unit?: string;
}

export const api = {
  stockLevels: () => req<StockLevel[]>("/stock/levels"),
  movements: () => req<Movement[]>("/stock/movements"),
  recordMovement: (m: NewMovement) =>
    req<Movement>("/stock/movements", {
      method: "POST",
      body: JSON.stringify(m),
    }),
  vouchers: () => req<Voucher[]>("/vouchers"),
  createVoucher: (v: NewVoucher) =>
    req<Voucher>("/vouchers", { method: "POST", body: JSON.stringify(v) }),
  groups: () => req<Group[]>("/groups"),
  createGroup: (g: NewGroup) =>
    req<Group>("/groups", { method: "POST", body: JSON.stringify(g) }),
  deleteGroup: (id: number) =>
    req<void>(`/groups/${id}`, { method: "DELETE" }),

  ledgers: () => req<Ledger[]>("/ledgers"),
  createLedger: (l: NewLedger) =>
    req<Ledger>("/ledgers", { method: "POST", body: JSON.stringify(l) }),
  deleteLedger: (id: number) =>
    req<void>(`/ledgers/${id}`, { method: "DELETE" }),

  stockItems: () => req<StockItem[]>("/stock-items"),
  createStockItem: (s: NewStockItem) =>
    req<StockItem>("/stock-items", { method: "POST", body: JSON.stringify(s) }),
  deleteStockItem: (id: number) =>
    req<void>(`/stock-items/${id}`, { method: "DELETE" }),
};
