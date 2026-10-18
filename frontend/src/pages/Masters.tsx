import { useState, type FormEvent } from "react";
import { PageTitle } from "../components/AppShell";
import { Button, Field, Input, Panel, PanelHead, Select } from "../components/ui";
import { usePlant } from "../lib/store";
import { money } from "../lib/format";
import type { Nature } from "../lib/types";

const natureLabel: Record<Nature, string> = {
  ASSET: "Asset",
  LIABILITY: "Liability",
  INCOME: "Income",
  EXPENSE: "Expense",
};
const NATURES = Object.keys(natureLabel) as Nature[];

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="text-ink-soft transition-colors hover:text-crit"
    >
      ×
    </button>
  );
}

function Toggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-500 text-water hover:underline"
    >
      {open ? "Close" : "+ Add"}
    </button>
  );
}

export function Masters() {
  const {
    groups,
    ledgers,
    stockItems,
    createGroup,
    deleteGroup,
    createLedger,
    deleteLedger,
    createStockItem,
    deleteStockItem,
  } = usePlant();

  // ── Ledger form ──
  const [lOpen, setLOpen] = useState(false);
  const [lName, setLName] = useState("");
  const [lGroup, setLGroup] = useState<number>(groups[0]?.id ?? 0);
  const [lOpening, setLOpening] = useState("");
  const [lErr, setLErr] = useState<string | null>(null);
  if (lGroup === 0 && groups[0]) setLGroup(groups[0].id);

  async function addLedger(e: FormEvent) {
    e.preventDefault();
    if (!lName.trim()) return setLErr("Give the ledger a name.");
    try {
      await createLedger({ name: lName.trim(), groupId: lGroup, openingBalance: Number(lOpening) || 0 });
      setLName("");
      setLOpening("");
      setLErr(null);
      setLOpen(false);
    } catch (e) {
      setLErr(e instanceof Error ? e.message : "Could not save.");
    }
  }

  // ── Group form ──
  const [gOpen, setGOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gNature, setGNature] = useState<Nature>("ASSET");
  const [gErr, setGErr] = useState<string | null>(null);

  async function addGroup(e: FormEvent) {
    e.preventDefault();
    if (!gName.trim()) return setGErr("Give the group a name.");
    try {
      await createGroup({ name: gName.trim(), nature: gNature });
      setGName("");
      setGErr(null);
      setGOpen(false);
    } catch (e) {
      setGErr(e instanceof Error ? e.message : "Could not save.");
    }
  }

  // ── Stock item form ──
  const [sOpen, setSOpen] = useState(false);
  const [sName, setSName] = useState("");
  const [sSize, setSSize] = useState("");
  const [sUnit, setSUnit] = useState("bottle");
  const [sErr, setSErr] = useState<string | null>(null);

  async function addStock(e: FormEvent) {
    e.preventDefault();
    const size = Number(sSize);
    if (!sName.trim() || !size) return setSErr("Enter a name and size.");
    try {
      await createStockItem({ name: sName.trim(), sizeMl: size, unit: sUnit });
      setSName("");
      setSSize("");
      setSErr(null);
      setSOpen(false);
    } catch (e) {
      setSErr(e instanceof Error ? e.message : "Could not save.");
    }
  }

  const row = "border-t border-line/70";

  return (
    <>
      <PageTitle title="Masters" sub="The accounts and items you post against" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHead
            title="Ledgers"
            hint={`${ledgers.length}`}
            right={<Toggle open={lOpen} onClick={() => setLOpen((v) => !v)} />}
          />
          {lOpen && (
            <form className="grid gap-3 border-b border-line bg-paper/40 p-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={addLedger}>
              <Field label="Name">
                <Input value={lName} onChange={(e) => setLName(e.target.value)} placeholder="e.g. GST Payable" />
              </Field>
              <Field label="Group">
                <Select value={lGroup} onChange={(e) => setLGroup(Number(e.target.value))}>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end gap-2">
                <Field label="Opening">
                  <Input className="w-24" type="number" value={lOpening} onChange={(e) => setLOpening(e.target.value)} placeholder="0" />
                </Field>
                <Button type="submit">Add</Button>
              </div>
              {lErr && <p className="text-sm text-crit sm:col-span-3">{lErr}</p>}
            </form>
          )}
          <table className="w-full text-sm">
            <tbody>
              {ledgers.map((l) => (
                <tr key={l.id} className={row}>
                  <td className="py-2.5 pl-5 pr-2 font-500">{l.name}</td>
                  <td className="px-2 py-2.5 text-ink-soft">{l.groupName}</td>
                  <td className="px-2 py-2.5 text-right tnum text-ink-soft">{money(l.openingBalance)}</td>
                  <td className="py-2.5 pl-2 pr-5 text-right">
                    <DeleteButton onClick={() => deleteLedger(l.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel>
          <PanelHead
            title="Groups"
            hint="chart of accounts"
            right={<Toggle open={gOpen} onClick={() => setGOpen((v) => !v)} />}
          />
          {gOpen && (
            <form className="grid gap-3 border-b border-line bg-paper/40 p-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={addGroup}>
              <Field label="Name">
                <Input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="e.g. Indirect Incomes" />
              </Field>
              <Field label="Nature">
                <Select value={gNature} onChange={(e) => setGNature(e.target.value as Nature)}>
                  {NATURES.map((n) => (
                    <option key={n} value={n}>
                      {natureLabel[n]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button type="submit">Add</Button>
              </div>
              {gErr && <p className="text-sm text-crit sm:col-span-3">{gErr}</p>}
            </form>
          )}
          <table className="w-full text-sm">
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className={row}>
                  <td className="py-2.5 pl-5 pr-2 font-500">{g.name}</td>
                  <td className="px-2 py-2.5 text-ink-soft">{natureLabel[g.nature]}</td>
                  <td className="py-2.5 pl-2 pr-5 text-right">
                    <DeleteButton onClick={() => deleteGroup(g.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel className="mt-5">
        <PanelHead
          title="Stock items"
          hint="finished goods"
          right={<Toggle open={sOpen} onClick={() => setSOpen((v) => !v)} />}
        />
        {sOpen && (
          <form className="grid gap-3 border-b border-line bg-paper/40 p-4 sm:grid-cols-[1fr_auto_auto_auto]" onSubmit={addStock}>
            <Field label="Name">
              <Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. 300 ml Water Bottle" />
            </Field>
            <Field label="Size (ml)">
              <Input className="w-24" type="number" value={sSize} onChange={(e) => setSSize(e.target.value)} placeholder="300" />
            </Field>
            <Field label="Unit">
              <Input className="w-24" value={sUnit} onChange={(e) => setSUnit(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button type="submit">Add</Button>
            </div>
            {sErr && <p className="text-sm text-crit sm:col-span-4">{sErr}</p>}
          </form>
        )}
        <table className="w-full text-sm">
          <tbody>
            {stockItems.map((s) => (
              <tr key={s.id} className={row}>
                <td className="py-2.5 pl-5 pr-2 font-500">{s.name}</td>
                <td className="px-2 py-2.5 text-right tnum text-ink-soft">{s.sizeMl} ml</td>
                <td className="px-2 py-2.5 text-ink-soft">{s.unit}</td>
                <td className="py-2.5 pl-2 pr-5 text-right">
                  <DeleteButton onClick={() => deleteStockItem(s.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
