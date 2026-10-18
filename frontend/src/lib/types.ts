export type Nature = "ASSET" | "LIABILITY" | "INCOME" | "EXPENSE";
export type VoucherType =
  | "PAYMENT"
  | "RECEIPT"
  | "CONTRA"
  | "JOURNAL"
  | "SALES"
  | "PURCHASE";
export type Direction = "IN" | "OUT";

export interface StockLevel {
  stockItemId: number;
  name: string;
  sizeMl: number;
  unit: string;
  onHand: number;
  producedTotal: number;
  soldTotal: number;
}

export interface Movement {
  id: number;
  stockItemId: number;
  stockItemName: string;
  date: string;
  direction: Direction;
  quantity: number;
  note?: string | null;
}

export interface Group {
  id: number;
  name: string;
  nature: Nature;
  parentId: number | null;
}

export interface Ledger {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  openingBalance: number;
}

export interface StockItem {
  id: number;
  name: string;
  sizeMl: number;
  unit: string;
}

export interface VoucherEntry {
  ledgerId: number;
  ledgerName: string;
  debit: number;
  credit: number;
}

export interface Voucher {
  id: number;
  voucherType: VoucherType;
  date: string;
  voucherNumber: string;
  narration?: string | null;
  total: number;
  entries: VoucherEntry[];
}
