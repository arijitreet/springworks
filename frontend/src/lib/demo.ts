import type {
  Group,
  Ledger,
  Movement,
  StockItem,
  StockLevel,
  Voucher,
} from "./types";

// Sample data so the app is legible before the API is connected.
// The UI shows a clear "sample data" banner whenever this is in use.

export const demoStockItems: StockItem[] = [
  { id: 1, name: "1000 ml Water Bottle", sizeMl: 1000, unit: "bottle" },
  { id: 2, name: "500 ml Water Bottle", sizeMl: 500, unit: "bottle" },
  { id: 3, name: "200 ml Water Bottle", sizeMl: 200, unit: "bottle" },
];

export const demoLevels: StockLevel[] = [
  {
    stockItemId: 1,
    name: "1000 ml Water Bottle",
    sizeMl: 1000,
    unit: "bottle",
    onHand: 8400,
    producedTotal: 24000,
    soldTotal: 15600,
  },
  {
    stockItemId: 2,
    name: "500 ml Water Bottle",
    sizeMl: 500,
    unit: "bottle",
    onHand: 12250,
    producedTotal: 36000,
    soldTotal: 23750,
  },
  {
    stockItemId: 3,
    name: "200 ml Water Bottle",
    sizeMl: 200,
    unit: "bottle",
    onHand: 3100,
    producedTotal: 48000,
    soldTotal: 44900,
  },
];

export const demoMovements: Movement[] = [
  { id: 7, stockItemId: 2, stockItemName: "500 ml Water Bottle", date: "2026-10-18", direction: "OUT", quantity: 2400, note: "Dispatch — Metro Distributors" },
  { id: 6, stockItemId: 1, stockItemName: "1000 ml Water Bottle", date: "2026-10-18", direction: "IN", quantity: 3000, note: "Line A morning shift" },
  { id: 5, stockItemId: 3, stockItemName: "200 ml Water Bottle", date: "2026-10-17", direction: "OUT", quantity: 5000, note: "Event order" },
  { id: 4, stockItemId: 3, stockItemName: "200 ml Water Bottle", date: "2026-10-17", direction: "IN", quantity: 6000, note: "Line B" },
  { id: 3, stockItemId: 2, stockItemName: "500 ml Water Bottle", date: "2026-10-16", direction: "IN", quantity: 4500, note: "Line A" },
];

export const demoGroups: Group[] = [
  { id: 1, name: "Capital Account", nature: "LIABILITY", parentId: null },
  { id: 2, name: "Current Liabilities", nature: "LIABILITY", parentId: null },
  { id: 3, name: "Current Assets", nature: "ASSET", parentId: null },
  { id: 4, name: "Fixed Assets", nature: "ASSET", parentId: null },
  { id: 5, name: "Sales Accounts", nature: "INCOME", parentId: null },
  { id: 7, name: "Purchase Accounts", nature: "EXPENSE", parentId: null },
  { id: 8, name: "Direct Expenses", nature: "EXPENSE", parentId: null },
  { id: 9, name: "Indirect Expenses", nature: "EXPENSE", parentId: null },
];

export const demoLedgers: Ledger[] = [
  { id: 1, name: "Cash", groupId: 3, groupName: "Current Assets", openingBalance: 0 },
  { id: 2, name: "Bank", groupId: 3, groupName: "Current Assets", openingBalance: 0 },
  { id: 3, name: "Sales", groupId: 5, groupName: "Sales Accounts", openingBalance: 0 },
  { id: 4, name: "Purchases", groupId: 7, groupName: "Purchase Accounts", openingBalance: 0 },
  { id: 5, name: "Capital", groupId: 1, groupName: "Capital Account", openingBalance: 0 },
];

export const demoVouchers: Voucher[] = [
  {
    id: 3,
    voucherType: "SALES",
    date: "2026-10-18",
    voucherNumber: "S-0042",
    narration: "Sale to Metro Distributors",
    total: 60000,
    entries: [
      { ledgerId: 2, ledgerName: "Bank", debit: 60000, credit: 0 },
      { ledgerId: 3, ledgerName: "Sales", debit: 0, credit: 60000 },
    ],
  },
  {
    id: 2,
    voucherType: "PURCHASE",
    date: "2026-10-17",
    voucherNumber: "P-0019",
    narration: "Preform and cap purchase",
    total: 38500,
    entries: [
      { ledgerId: 4, ledgerName: "Purchases", debit: 38500, credit: 0 },
      { ledgerId: 2, ledgerName: "Bank", debit: 0, credit: 38500 },
    ],
  },
  {
    id: 1,
    voucherType: "RECEIPT",
    date: "2026-10-16",
    voucherNumber: "R-0007",
    narration: "Owner capital introduced",
    total: 200000,
    entries: [
      { ledgerId: 1, ledgerName: "Cash", debit: 200000, credit: 0 },
      { ledgerId: 5, ledgerName: "Capital", debit: 0, credit: 200000 },
    ],
  },
];
