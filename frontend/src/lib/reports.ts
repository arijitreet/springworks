import type { Group, Ledger, Voucher } from "./types";

export interface Line {
  name: string;
  amount: number;
}

export interface TrialRow {
  ledger: string;
  debit: number;
  credit: number;
}

export interface ProfitAndLoss {
  income: Line[];
  expense: Line[];
  totalIncome: number;
  totalExpense: number;
  netProfit: number; // positive = profit, negative = loss
}

export interface BalanceSheet {
  assets: Line[];
  liabilities: Line[];
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number; // includes net profit
  balanced: boolean;
}

const EPS = 0.005;

/**
 * Debit-positive net per ledger: opening + sum(debit - credit) over all entries.
 * Assets and expenses carry a positive (debit) balance; liabilities and income
 * carry a negative (credit) balance, flipped to positive in the statements.
 */
function netByLedger(ledgers: Ledger[], vouchers: Voucher[]) {
  const net = new Map<number, number>();
  for (const l of ledgers) net.set(l.id, l.openingBalance ?? 0);
  for (const v of vouchers) {
    for (const e of v.entries) {
      net.set(e.ledgerId, (net.get(e.ledgerId) ?? 0) + e.debit - e.credit);
    }
  }
  return net;
}

export function trialBalance(ledgers: Ledger[], vouchers: Voucher[]): TrialRow[] {
  const net = netByLedger(ledgers, vouchers);
  return ledgers
    .map((l) => {
      const n = net.get(l.id) ?? 0;
      return { ledger: l.name, debit: n > 0 ? n : 0, credit: n < 0 ? -n : 0 };
    })
    .filter((r) => r.debit > EPS || r.credit > EPS)
    .sort((a, b) => a.ledger.localeCompare(b.ledger));
}

export function profitAndLoss(
  ledgers: Ledger[],
  groups: Group[],
  vouchers: Voucher[],
): ProfitAndLoss {
  const net = netByLedger(ledgers, vouchers);
  const natureByGroup = new Map(groups.map((g) => [g.id, g.nature]));

  const income: Line[] = [];
  const expense: Line[] = [];
  for (const l of ledgers) {
    const nature = natureByGroup.get(l.groupId);
    const n = net.get(l.id) ?? 0;
    if (nature === "INCOME" && Math.abs(n) > EPS) income.push({ name: l.name, amount: -n });
    if (nature === "EXPENSE" && Math.abs(n) > EPS) expense.push({ name: l.name, amount: n });
  }
  income.sort((a, b) => b.amount - a.amount);
  expense.sort((a, b) => b.amount - a.amount);

  const totalIncome = income.reduce((s, x) => s + x.amount, 0);
  const totalExpense = expense.reduce((s, x) => s + x.amount, 0);
  return { income, expense, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

export function balanceSheet(
  ledgers: Ledger[],
  groups: Group[],
  vouchers: Voucher[],
): BalanceSheet {
  const net = netByLedger(ledgers, vouchers);
  const natureByGroup = new Map(groups.map((g) => [g.id, g.nature]));

  const assets: Line[] = [];
  const liabilities: Line[] = [];
  for (const l of ledgers) {
    const nature = natureByGroup.get(l.groupId);
    const n = net.get(l.id) ?? 0;
    if (nature === "ASSET" && Math.abs(n) > EPS) assets.push({ name: l.name, amount: n });
    if (nature === "LIABILITY" && Math.abs(n) > EPS) liabilities.push({ name: l.name, amount: -n });
  }
  assets.sort((a, b) => b.amount - a.amount);
  liabilities.sort((a, b) => b.amount - a.amount);

  const { netProfit } = profitAndLoss(ledgers, groups, vouchers);
  const totalAssets = assets.reduce((s, x) => s + x.amount, 0);
  const totalLiabilities = liabilities.reduce((s, x) => s + x.amount, 0) + netProfit;
  return {
    assets,
    liabilities,
    netProfit,
    totalAssets,
    totalLiabilities,
    balanced: Math.abs(totalAssets - totalLiabilities) < 0.01,
  };
}
