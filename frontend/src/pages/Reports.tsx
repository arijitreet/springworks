import { useMemo, useState } from "react";
import { PageTitle } from "../components/AppShell";
import { Badge, Panel, PanelHead } from "../components/ui";
import { usePlant } from "../lib/store";
import { money } from "../lib/format";
import {
  balanceSheet,
  profitAndLoss,
  trialBalance,
  type Line,
} from "../lib/reports";

type Tab = "trial" | "pnl" | "balance";
const TABS: { id: Tab; label: string }[] = [
  { id: "trial", label: "Trial balance" },
  { id: "pnl", label: "Profit & Loss" },
  { id: "balance", label: "Balance sheet" },
];

export function Reports() {
  const { ledgers, groups, vouchers } = usePlant();
  const [tab, setTab] = useState<Tab>("trial");

  const tb = useMemo(() => trialBalance(ledgers, vouchers), [ledgers, vouchers]);
  const pnl = useMemo(() => profitAndLoss(ledgers, groups, vouchers), [ledgers, groups, vouchers]);
  const bs = useMemo(() => balanceSheet(ledgers, groups, vouchers), [ledgers, groups, vouchers]);

  const tbDr = tb.reduce((s, r) => s + r.debit, 0);
  const tbCr = tb.reduce((s, r) => s + r.credit, 0);

  return (
    <>
      <PageTitle title="Reports" sub="Built from the day book" />

      <div className="mb-5 inline-flex rounded-md border border-line bg-surface p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-8 rounded px-3.5 text-sm font-500 transition-colors ${
              tab === t.id ? "bg-water text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "trial" && (
        <Panel>
          <PanelHead
            title="Trial balance"
            right={
              <Badge tone={Math.abs(tbDr - tbCr) < 0.005 ? "in" : "out"}>
                {Math.abs(tbDr - tbCr) < 0.005 ? "Ties out" : "Out of balance"}
              </Badge>
            }
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-soft">
                <th className="py-2.5 pl-5 pr-2 font-500">Ledger</th>
                <th className="px-2 py-2.5 text-right font-500">Debit</th>
                <th className="py-2.5 pl-2 pr-5 text-right font-500">Credit</th>
              </tr>
            </thead>
            <tbody>
              {tb.map((r) => (
                <tr key={r.ledger} className="border-t border-line/70">
                  <td className="py-2.5 pl-5 pr-2">{r.ledger}</td>
                  <td className="px-2 py-2.5 text-right tnum">{r.debit ? money(r.debit) : ""}</td>
                  <td className="py-2.5 pl-2 pr-5 text-right tnum">{r.credit ? money(r.credit) : ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink/80 font-600">
                <td className="py-2.5 pl-5 pr-2">Total</td>
                <td className="px-2 py-2.5 text-right tnum">{money(tbDr)}</td>
                <td className="py-2.5 pl-2 pr-5 text-right tnum">{money(tbCr)}</td>
              </tr>
            </tfoot>
          </table>
        </Panel>
      )}

      {tab === "pnl" && (
        <Panel>
          <PanelHead
            title="Profit & Loss"
            right={
              <Badge tone={pnl.netProfit >= 0 ? "in" : "out"}>
                {pnl.netProfit >= 0 ? "Net profit " : "Net loss "}
                {money(Math.abs(pnl.netProfit))}
              </Badge>
            }
          />
          <TStatement
            left={{
              title: "Expenses",
              lines: pnl.expense,
              extra: pnl.netProfit > 0 ? { name: "Net Profit", amount: pnl.netProfit } : undefined,
              total: pnl.totalExpense + Math.max(pnl.netProfit, 0),
            }}
            right={{
              title: "Income",
              lines: pnl.income,
              extra: pnl.netProfit < 0 ? { name: "Net Loss", amount: -pnl.netProfit } : undefined,
              total: pnl.totalIncome + Math.max(-pnl.netProfit, 0),
            }}
          />
        </Panel>
      )}

      {tab === "balance" && (
        <Panel>
          <PanelHead
            title="Balance sheet"
            right={
              <Badge tone={bs.balanced ? "in" : "out"}>
                {bs.balanced ? "Balanced" : "Out of balance"}
              </Badge>
            }
          />
          <TStatement
            left={{
              title: "Liabilities",
              lines: bs.liabilities,
              extra:
                Math.abs(bs.netProfit) > 0.005
                  ? { name: bs.netProfit >= 0 ? "Net Profit (capital)" : "Net Loss (capital)", amount: bs.netProfit }
                  : undefined,
              total: bs.totalLiabilities,
            }}
            right={{ title: "Assets", lines: bs.assets, total: bs.totalAssets }}
          />
        </Panel>
      )}
    </>
  );
}

interface Side {
  title: string;
  lines: Line[];
  extra?: Line;
  total: number;
}

function Column({ side }: { side: Side }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-line px-5 py-2 text-xs font-600 text-ink-soft">
        <span>{side.title}</span>
        <span>Amount</span>
      </div>
      <div className="flex-1">
        <table className="w-full text-sm">
          <tbody>
            {side.lines.map((l) => (
              <tr key={l.name} className="border-b border-line/60">
                <td className="py-2.5 pl-5 pr-2">{l.name}</td>
                <td className="py-2.5 pl-2 pr-5 text-right tnum">{money(l.amount)}</td>
              </tr>
            ))}
            {side.extra && (
              <tr className="border-b border-line/60">
                <td className="py-2.5 pl-5 pr-2 font-600 text-water">{side.extra.name}</td>
                <td className="py-2.5 pl-2 pr-5 text-right tnum font-600 text-water">
                  {money(side.extra.amount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink/80 px-5 py-2.5 text-sm font-600">
        <span>Total</span>
        <span className="tnum">{money(side.total)}</span>
      </div>
    </div>
  );
}

function TStatement({ left, right }: { left: Side; right: Side }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-line">
      <Column side={left} />
      <div className="border-t border-line sm:border-t-0">
        <Column side={right} />
      </div>
    </div>
  );
}
