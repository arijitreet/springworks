import { NavLink, Outlet } from "react-router-dom";
import { usePlant } from "../lib/store";

const nav = [
  { to: "/", label: "Overview", end: true, icon: IconGauge },
  { to: "/vouchers", label: "Vouchers", icon: IconBook },
  { to: "/stock", label: "Stock", icon: IconBottle },
  { to: "/masters", label: "Masters", icon: IconList },
  { to: "/reports", label: "Reports", icon: IconChart },
];

export function AppShell() {
  const { source } = usePlant();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <Drop />
          <div className="leading-tight">
            <div className="font-display text-[17px] font-700 tracking-tight text-ink">
              Spring Works
            </div>
            <div className="text-[11px] text-ink-soft">Books &amp; Stock</div>
          </div>
        </div>

        <nav className="mt-7 flex flex-col gap-0.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-500 transition-colors ${
                  isActive
                    ? "bg-water/10 text-water"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`
              }
            >
              <n.icon />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-2">
          <div className="flex items-center gap-2 text-[11px] text-ink-soft">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                source === "live"
                  ? "bg-good"
                  : source === "sample"
                    ? "bg-warn"
                    : "bg-line"
              }`}
            />
            {source === "live"
              ? "API connected"
              : source === "sample"
                ? "Sample data"
                : "Connecting…"}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {source === "sample" && (
          <div className="border-b border-warn/25 bg-warn/8 px-6 py-2 text-[13px] text-ink">
            Showing sample data — the API isn&apos;t connected yet. Set{" "}
            <code className="rounded bg-surface px-1 py-0.5 text-[12px]">
              VITE_API_URL
            </code>{" "}
            to your Render URL to go live.
          </div>
        )}
        <main className="mx-auto w-full max-w-5xl px-6 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-700 tracking-tight text-ink">
          {title}
        </h1>
        {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

function Drop() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2c3.2 3.7 5.3 6.6 5.3 9.4A5.3 5.3 0 0 1 12 18a5.3 5.3 0 0 1-5.3-5.4c0-2.8 2.1-5.7 5.3-9.4Z"
        fill="#0B6E8C"
      />
      <path
        d="M9.6 12.6c0 1.4 1.1 2.5 2.4 2.5"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function base(path: string) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconGauge() {
  return base("M12 13 16 9M5.5 18a8 8 0 1 1 13 0");
}
function IconBook() {
  return base("M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4ZM5 4v12M9 8h6M9 12h6");
}
function IconBottle() {
  return base("M10 2h4M10.5 2v2.5L9 7v13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V7l-1.5-2.5V2M9 12h6");
}
function IconList() {
  return base("M4 6h16M4 12h16M4 18h16");
}
function IconChart() {
  return base("M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6");
}
