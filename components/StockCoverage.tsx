"use client";

import { useState } from "react";

const code = [
  "def stock_coverage(stock, daily_demand):",
  "    if stock < 0 or daily_demand < 0:",
  '        raise ValueError("Quantities cannot be negative")',
  "    if daily_demand == 0:",
  "        return None",
  "    return stock / daily_demand",
  "",
  "def classify(days):",
  "    if days is None:",
  '        return "Coverage not applicable"',
  "    elif days < 7:",
  '        return "Reorder now"',
  "    elif days < 14:",
  '        return "Monitor"',
  "    else:",
  '        return "Sufficient"',
];

const presets = [
  { label: "Low stock", stock: "20", demand: "10" },
  { label: "Healthy stock", stock: "200", demand: "10" },
  { label: "Zero demand", stock: "50", demand: "0" },
  { label: "Invalid input", stock: "-5", demand: "10" },
];

type Analysis =
  | { status: "empty" }
  | { status: "error"; lines: number[]; message: string }
  | {
      status: "ok";
      lines: number[];
      coverage: number | null;
      verdict: string;
    };

function analyse(stockText: string, demandText: string): Analysis {
  if (stockText.trim() === "" || demandText.trim() === "") {
    return { status: "empty" };
  }

  const stock = Number(stockText);
  const demand = Number(demandText);
  if (Number.isNaN(stock) || Number.isNaN(demand)) return { status: "empty" };

  if (stock < 0 || demand < 0) {
    return {
      status: "error",
      lines: [0, 1, 2],
      message: "ValueError: Quantities cannot be negative",
    };
  }

  if (demand === 0) {
    return {
      status: "ok",
      lines: [0, 1, 3, 4, 7, 8, 9],
      coverage: null,
      verdict: "Coverage not applicable",
    };
  }

  const days = stock / demand;

  if (days < 7) {
    return {
      status: "ok",
      lines: [0, 1, 3, 5, 7, 8, 10, 11],
      coverage: days,
      verdict: "Reorder now",
    };
  }
  if (days < 14) {
    return {
      status: "ok",
      lines: [0, 1, 3, 5, 7, 8, 10, 12, 13],
      coverage: days,
      verdict: "Monitor",
    };
  }
  return {
    status: "ok",
    lines: [0, 1, 3, 5, 7, 8, 10, 12, 14, 15],
    coverage: days,
    verdict: "Sufficient",
  };
}

const inputClass =
  "mt-1 w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-black dark:border-white/30 dark:focus:border-white";

export default function StockCoverage() {
  const [stock, setStock] = useState("40");
  const [demand, setDemand] = useState("10");

  const result = analyse(stock, demand);
  const active = result.status === "empty" ? [] : result.lines;

  return (
    <figure className="not-prose my-10 rounded-2xl border border-black/15 p-6 dark:border-white/20">
      <figcaption className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
        Stock Coverage Demo
      </figcaption>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-black/60 dark:text-white/60">
            Units in stock
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="text-black/60 dark:text-white/60">
            Units sold per day
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={demand}
            onChange={(e) => setDemand(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setStock(p.stock);
              setDemand(p.demand);
            }}
            className="rounded-full border border-black/20 px-3 py-1 text-xs transition hover:bg-black hover:text-white dark:border-white/30 dark:hover:bg-white dark:hover:text-black"
          >
            {p.label}
          </button>
        ))}
      </div>

      <pre className="mt-6 overflow-x-auto rounded-xl bg-black/5 py-3 font-mono text-xs leading-6 dark:bg-white/10">
        <code>
          {code.map((line, i) => (
            <div
              key={i}
              className={`px-4 ${
                active.includes(i)
                  ? "bg-black/10 dark:bg-white/20"
                  : "text-black/40 dark:text-white/40"
              }`}
            >
              {line || " "}
            </div>
          ))}
        </code>
      </pre>

      <div aria-live="polite" className="mt-6">
        {result.status === "empty" && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Enter both numbers to see the result.
          </p>
        )}

        {result.status === "error" && (
          <p className="rounded-lg border border-dashed border-black/40 p-3 font-mono text-sm dark:border-white/50">
            {result.message}
          </p>
        )}

        {result.status === "ok" && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-black/50 dark:text-white/50">
                stock_coverage()
              </dt>
              <dd className="mt-1 font-mono text-base">
                {result.coverage === null
                  ? "None"
                  : `${result.coverage.toFixed(1)} days`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-black/50 dark:text-white/50">
                classify()
              </dt>
              <dd className="mt-1 text-base font-semibold">
                {result.verdict}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <p className="mt-6 text-sm italic text-black/50 dark:text-white/50">
        This demo runs in your browser and mirrors the Python
        logic shown above. The 7- and 14-day thresholds are illustrative, not
        taken from any company.
      </p>
    </figure>
  );
}
