"use client";

import { useState } from "react";

export type Segment = {
  name: string;
  share: number; // percent of total, 0 to 100
  start: number; // where the segment begins, 0 to 100
  len: number; // visible length, a little shorter than share to leave a gap
  opacity: number;
};

const R = 76;
const WIDTH = 16;

export default function DonutChart({
  segments,
  total,
}: {
  segments: Segment[];
  total: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : segments[active];

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
      <div className="relative h-52 w-52 shrink-0">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          role="img"
          aria-label="Revenue share by product category, last 12 months"
        >
          <g transform="rotate(-90 100 100)">
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeWidth={WIDTH}
            />
            {segments.map((s, i) => (
              <circle
                key={s.name}
                className="donut-seg"
                cx="100"
                cy="100"
                r={R}
                pathLength={100}
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${s.len} ${100 - s.len}`}
                strokeDashoffset={-s.start}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                style={
                  {
                    "--i": i,
                    strokeWidth: active === i ? WIDTH + 5 : WIDTH,
                    opacity: active === null || active === i ? s.opacity : 0.15,
                    transition: "opacity 0.25s, stroke-width 0.25s",
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </svg>

        <div className="fade-area pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-semibold tabular-nums">
            {current ? `${current.share.toFixed(1)}%` : total}
          </p>
          <p className="mt-0.5 max-w-[7rem] text-xs text-black/50 dark:text-white/50">
            {current ? current.name : "revenue, last 12 months"}
          </p>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-1 text-sm">
        {segments.map((s, i) => (
          <li
            key={s.name}
            className={`donut-leg flex items-center gap-3 rounded-md px-2 py-1 transition-colors ${
              active === i ? "bg-black/5 dark:bg-white/10" : ""
            }`}
            style={{ "--i": i } as React.CSSProperties}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-sm bg-current"
              style={{ opacity: s.opacity }}
            />
            <span className="flex-1">{s.name}</span>
            <span className="tabular-nums text-black/50 dark:text-white/50">
              {s.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}