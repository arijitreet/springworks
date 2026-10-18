import { Tank } from "../components/Tank";
import { Badge, Panel, PanelHead } from "../components/ui";
import { PageTitle } from "../components/AppShell";
import { usePlant } from "../lib/store";
import { count, money, shortDate, today } from "../lib/format";

const TANK_COLORS = ["#074C62", "#0B6E8C", "#16A3C7"];

export function Overview() {
  const { levels, movements, vouchers } = usePlant();

  const capacity = Math.max(1, ...levels.map((l) => l.onHand));
  const totalOnHand = levels.reduce((s, l) => s + l.onHand, 0);

  const td = today();
  const producedToday = movements
    .filter((m) => m.date === td && m.direction === "IN")
    .reduce((s, m) => s + m.quantity, 0);
  const soldToday = movements
    .filter((m) => m.date === td && m.direction === "OUT")
    .reduce((s, m) => s + m.quantity, 0);

  const niceDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <PageTitle title="Overview" sub={niceDate} />

      <Panel>
        <PanelHead title="Stock on hand" hint="finished goods" />
        <div className="flex flex-wrap items-end justify-around gap-6 px-5 py-7">
          {levels.map((l, i) => (
            <Tank
              key={l.stockItemId}
              level={l}
              capacity={capacity}
              color={TANK_COLORS[i % TANK_COLORS.length]}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm">
          <span className="text-ink-soft">
            {count(totalOnHand)} bottles across three sizes
          </span>
          <span className="text-ink-soft tnum">
            Today: <span className="text-good">+{count(producedToday)}</span>{" "}
            made · <span className="text-warn">−{count(soldToday)}</span> sold
          </span>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Latest movements" />
          <table className="w-full text-sm">
            <tbody>
              {movements.slice(0, 6).map((m) => (
                <tr key={m.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pl-5 pr-2 text-ink-soft tnum whitespace-nowrap">
                    {shortDate(m.date)}
                  </td>
                  <td className="px-2 py-2.5">{m.stockItemName}</td>
                  <td className="px-2 py-2.5">
                    <Badge tone={m.direction === "IN" ? "in" : "out"}>
                      {m.direction === "IN" ? "Made" : "Sold"}
                    </Badge>
                  </td>
                  <td className="py-2.5 pl-2 pr-5 text-right tnum">
                    {count(m.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel>
          <PanelHead title="Day book" hint="latest vouchers" />
          <table className="w-full text-sm">
            <tbody>
              {vouchers.slice(0, 6).map((v) => (
                <tr key={v.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pl-5 pr-2 text-ink-soft tnum whitespace-nowrap">
                    {shortDate(v.date)}
                  </td>
                  <td className="px-2 py-2.5 text-ink-soft">{v.voucherNumber}</td>
                  <td className="px-2 py-2.5 capitalize">
                    {v.voucherType.toLowerCase()}
                  </td>
                  <td className="py-2.5 pl-2 pr-5 text-right tnum">
                    {money(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
