import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-line bg-surface shadow-panel ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHead({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-[15px] font-600 tracking-tight text-ink">
          {title}
        </h2>
        {hint && <span className="text-xs text-ink-soft">{hint}</span>}
      </div>
      {right}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3.5 h-9 text-sm font-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water";
  const styles =
    variant === "primary"
      ? "bg-water text-white hover:bg-water-deep"
      : "border border-line bg-surface text-ink hover:bg-paper";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-500 text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const fieldCls =
  "h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-water focus:ring-2 focus:ring-water/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldCls} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldCls} pr-7`} {...props} />;
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "in" | "out" | "water";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper text-ink-soft",
    in: "bg-good/10 text-good",
    out: "bg-warn/12 text-warn",
    water: "bg-water/10 text-water",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-600 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
