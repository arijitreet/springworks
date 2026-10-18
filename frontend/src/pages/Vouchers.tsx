import { useMemo, useState, type FormEvent } from "react";
import { PageTitle } from "../components/AppShell";
import { Badge, Button, Field, Input, Panel, PanelHead, Select } from "../components/ui";
import { usePlant } from "../lib/store";
import { money, shortDate, today } from "../lib/format";
import type { VoucherType } from "../lib/types";

const TYPES: VoucherType[] = ["PAYMENT", "RECEIPT", "CONTRA", "JOURNAL", "SALES", "PURCHASE"];

interface Line {
  ledgerId: number;
  debit: string;
  credit: string;
}

export function Vouchers() {
  const { vouchers, ledgers, createVoucher } = usePlant();
  const firstLedger = ledgers[0]?.id ?? 0;

  const [type, setType] = useState<VoucherType>("SALES");
  const [date, setDate] = useState(today());
  const [number, setNumber] = useState("");
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { ledgerId: firstLedger, debit: "", credit: "" },
    { ledgerId: firstLedger, debit: "", credit: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totals = useMemo(() => {
    const d = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const c = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return { d, c, balanced: d === c && d > 0 };
  }, [lines]);

  function setLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  const addLine = () =>
    setLines((prev) => [...prev, { ledgerId: firstLedger, debit: "", credit: "" }]);
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!number.trim()) return setErr("Give the voucher a number.");
    if (!totals.balanced) return setErr("Debits must equal credits before saving.");
    setBusy(true);
    setErr(null);
    try {
      await createVoucher({
        voucherType: type,
        date,
        voucherNumber: number.trim(),
        narration: narration || undefined,
        entries: lines.map((l) => ({
          ledgerId: l.ledgerId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
        })),
      });
      setNumber("");
      setNarration("");
      setLines([
        { ledgerId: firstLedger, debit: "", credit: "" },
        { ledgerId: firstLedger, debit: "", credit: "" },
      ]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Vouchers" sub="Record a transaction, then see the day book" />

      <Panel>
        <PanelHead
          title="New voucher"
          right={
            <Badge tone={totals.balanced ? "in" : "neutral"}>
              {totals.balanced
                ? "Balanced"
                : `${money(totals.d)} Dr · ${money(totals.c)} Cr`}
            </Badge>
          }
        />
        <form className="p-5" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value as VoucherType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Number">
              <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="S-0043" />
            </Field>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Narration">
              <Input value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Optional" />
            </Field>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="bg-paper/60 text-left text-xs text-ink-soft">
                <tr>
                  <th className="py-2 pl-3 pr-2 font-500">Ledger</th>
                  <th className="px-2 py-2 text-right font-500">Debit</th>
                  <th className="px-2 py-2 text-right font-500">Credit</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-1.5 pl-3 pr-2">
                      <Select
                        className="w-full"
                        value={l.ledgerId}
                        onChange={(e) => setLine(i, { ledgerId: Number(e.target.value) })}
                      >
                        {ledgers.map((lg) => (
                          <option key={lg.id} value={lg.id}>
                            {lg.name}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        className="w-28 text-right tnum"
                        type="number"
                        min="0"
                        value={l.debit}
                        onChange={(e) => setLine(i, { debit: e.target.value, credit: "" })}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        className="w-28 text-right tnum"
                        type="number"
                        min="0"
                        value={l.credit}
                        onChange={(e) => setLine(i, { credit: e.target.value, debit: "" })}
                      />
                    </td>
                    <td className="pr-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="text-ink-soft hover:text-crit disabled:opacity-30"
                        disabled={lines.length <= 2}
                        aria-label="Remove line"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-paper/40 text-sm font-600">
                  <td className="py-2 pl-3 pr-2 text-ink-soft">
                    <button type="button" onClick={addLine} className="text-water hover:underline">
                      + Add line
                    </button>
                  </td>
                  <td className="px-2 py-2 text-right tnum">{money(totals.d)}</td>
                  <td className="px-2 py-2 text-right tnum">{money(totals.c)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-crit">{err}</span>
            <Button type="submit" disabled={busy || !totals.balanced}>
              {busy ? "Saving…" : "Save voucher"}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel className="mt-5">
        <PanelHead title="Day book" hint={`${vouchers.length} vouchers`} />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-soft">
              <th className="py-2.5 pl-5 pr-2 font-500">Date</th>
              <th className="px-2 py-2.5 font-500">No.</th>
              <th className="px-2 py-2.5 font-500">Type</th>
              <th className="px-2 py-2.5 font-500">Narration</th>
              <th className="py-2.5 pl-2 pr-5 text-right font-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-t border-line/70">
                <td className="py-2.5 pl-5 pr-2 text-ink-soft tnum whitespace-nowrap">{shortDate(v.date)}</td>
                <td className="px-2 py-2.5 text-ink-soft">{v.voucherNumber}</td>
                <td className="px-2 py-2.5 capitalize">{v.voucherType.toLowerCase()}</td>
                <td className="px-2 py-2.5 text-ink-soft">{v.narration}</td>
                <td className="py-2.5 pl-2 pr-5 text-right tnum font-500">{money(v.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
