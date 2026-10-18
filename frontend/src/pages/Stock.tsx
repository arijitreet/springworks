import { useState, type FormEvent } from "react";
import { PageTitle } from "../components/AppShell";
import { Badge, Button, Field, Input, Panel, PanelHead, Select } from "../components/ui";
import { usePlant } from "../lib/store";
import { count, shortDate, today } from "../lib/format";
import type { Direction } from "../lib/types";

export function Stock() {
  const { levels, movements, stockItems, recordMovement } = usePlant();

  const [itemId, setItemId] = useState<number>(stockItems[0]?.id ?? 0);
  const [direction, setDirection] = useState<Direction>("IN");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const firstId = stockItems[0]?.id;
  if (itemId === 0 && firstId) setItemId(firstId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!itemId || !qty || qty <= 0) {
      setErr("Enter a quantity greater than zero.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await recordMovement({ stockItemId: itemId, date, direction, quantity: qty, note: note || undefined });
      setQuantity("");
      setNote("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Stock" sub="Production and sales of each bottle size" />

      <Panel>
        <PanelHead title="Levels" />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-soft">
              <th className="py-2.5 pl-5 pr-2 font-500">Size</th>
              <th className="px-2 py-2.5 text-right font-500">Made</th>
              <th className="px-2 py-2.5 text-right font-500">Sold</th>
              <th className="py-2.5 pl-2 pr-5 text-right font-500">On hand</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.stockItemId} className="border-t border-line/70">
                <td className="py-3 pl-5 pr-2 font-500">{l.name}</td>
                <td className="px-2 py-3 text-right tnum text-ink-soft">{count(l.producedTotal)}</td>
                <td className="px-2 py-3 text-right tnum text-ink-soft">{count(l.soldTotal)}</td>
                <td className="py-3 pl-2 pr-5 text-right tnum font-600">{count(l.onHand)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <PanelHead title="Record movement" />
          <form className="flex flex-col gap-4 p-5" onSubmit={submit}>
            <Field label="Bottle size">
              <Select value={itemId} onChange={(e) => setItemId(Number(e.target.value))}>
                {stockItems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex gap-2">
              {(["IN", "OUT"] as Direction[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`h-9 flex-1 rounded-md border text-sm font-500 transition-colors ${
                    direction === d
                      ? d === "IN"
                        ? "border-good bg-good/10 text-good"
                        : "border-warn bg-warn/10 text-warn"
                      : "border-line text-ink-soft hover:bg-paper"
                  }`}
                >
                  {d === "IN" ? "Produced" : "Sold"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity">
                <Input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>

            <Field label="Note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shift, order, customer…" />
            </Field>

            {err && <p className="text-sm text-crit">{err}</p>}

            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Record"}
            </Button>
          </form>
        </Panel>

        <Panel className="lg:col-span-3">
          <PanelHead title="Movements" hint="newest first" />
          <table className="w-full text-sm">
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pl-5 pr-2 text-ink-soft tnum whitespace-nowrap">{shortDate(m.date)}</td>
                  <td className="px-2 py-2.5">{m.stockItemName}</td>
                  <td className="px-2 py-2.5">
                    <Badge tone={m.direction === "IN" ? "in" : "out"}>
                      {m.direction === "IN" ? "Made" : "Sold"}
                    </Badge>
                  </td>
                  <td className="px-2 py-2.5 text-ink-soft">{m.note}</td>
                  <td className="py-2.5 pl-2 pr-5 text-right tnum font-500">{count(m.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
