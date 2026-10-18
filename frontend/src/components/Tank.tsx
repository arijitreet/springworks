import { count } from "../lib/format";
import type { StockLevel } from "../lib/types";

/**
 * A tank gauge for one bottle size. Water height is on-hand relative to the
 * fullest tank, so the three read comparatively at a glance; the exact count
 * sits below.
 */
export function Tank({
  level,
  capacity,
  color,
}: {
  level: StockLevel;
  capacity: number;
  color: string;
}) {
  const frac = capacity > 0 ? Math.min(level.onHand / capacity, 1) : 0;
  const pct = Math.max(frac * 100, 2);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[92px] overflow-hidden rounded-[16px] border border-line bg-gradient-to-b from-paper/60 to-surface"
        style={{ height: 196 }}
        role="img"
        aria-label={`${level.name}: ${count(level.onHand)} on hand`}
      >
        {/* quarter-level marks */}
        {[25, 50, 75].map((t) => (
          <div
            key={t}
            className="absolute inset-x-0 border-t border-dashed border-line/70"
            style={{ bottom: `${t}%` }}
          />
        ))}
        {/* the water */}
        <div
          className="tank-fill absolute inset-x-0 bottom-0"
          style={{ height: `${pct}%`, background: color, ["--rise-to" as string]: "0%" }}
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/35" />
        </div>
      </div>

      <div className="mt-3.5 text-center">
        <div className="font-display text-2xl font-700 tabular-nums text-ink tnum">
          {count(level.onHand)}
        </div>
        <div className="text-xs text-ink-soft">
          {level.sizeMl} ml · on hand
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-ink-soft tnum">
          <span>
            <span className="text-good">▲</span> {count(level.producedTotal)} made
          </span>
          <span className="text-line">|</span>
          <span>
            <span className="text-warn">▼</span> {count(level.soldTotal)} sold
          </span>
        </div>
      </div>
    </div>
  );
}
