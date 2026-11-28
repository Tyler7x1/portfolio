"use client";

import { Fragment, useMemo, useState } from "react";
import View3D from "@/components/three/View3D";
import { DimToggle, type Dim } from "@/components/Dimension";
import {
  CATEGORIES,
  DATA,
  MONTHS,
  REGIONS,
  formatCount,
  formatCurrency,
  formatMetric,
  monthLabel,
  type Category,
  type Metric,
  type Region,
} from "@/lib/dashboardData";

type Period = 1 | 3 | 6 | 12;

const metricLabel: Record<Metric, string> = {
  revenue: "Revenue",
  orders: "Orders",
  units: "Units sold",
};

const regionOptions: { value: Region | "All"; label: string }[] = [
  { value: "All", label: "All" },
  ...REGIONS.map((r) => ({ value: r, label: r })),
];

const categoryOptions: { value: Category | "All"; label: string }[] = [
  { value: "All", label: "All" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

const periodOptions: { value: Period; label: string }[] = [
  { value: 1, label: "1M" },
  { value: 3, label: "3M" },
  { value: 6, label: "6M" },
  { value: 12, label: "12M" },
];

const metricOptions: { value: Metric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "orders", label: "Orders" },
  { value: "units", label: "Units" },
];

const breakdownOptions: { value: "category" | "region"; label: string }[] = [
  { value: "category", label: "By category" },
  { value: "region", label: "By region" },
];

type TrendType = "line" | "area" | "columns";
type View = "bars" | "donut";

const trendOptions: { value: TrendType; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "columns", label: "Columns" },
];

const viewOptions: { value: View; label: string }[] = [
  { value: "bars", label: "Bars" },
  { value: "donut", label: "Donut" },
];

function niceScale(v: number) {
  if (v <= 0) return { max: 4, step: 1 };
  const raw = v / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const s = (steps.find((x) => f <= x) ?? 10) * p;
  return { max: s * 4, step: s };
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/50">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                on
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/20 hover:border-black dark:border-white/30 dark:hover:border-white"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: number | null;
}) {
  return (
    <div className="rounded-xl border border-black/15 p-4 dark:border-white/20">
      <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-black/50 dark:text-white/50">
        {delta === null
          ? "No previous period"
          : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta * 100).toFixed(1)}% vs previous period`}
      </p>
    </div>
  );
}

function TrendChart({
  current,
  previous,
  labels,
  prevLabels,
  metric,
  type,
}: {
  current: number[];
  previous: number[];
  labels: string[];
  prevLabels: string[];
  metric: Metric;
  type: TrendType;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 240;
  const L = 56;
  const R = 16;
  const T = 16;
  const B = 28;
  const n = current.length;
  const { max, step } = niceScale(Math.max(...current, ...previous));
  const innerW = W - L - R;

  const x = (i: number) =>
    type === "columns"
      ? L + ((i + 0.5) / n) * innerW
      : L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const line = (vals: number[]) =>
    vals
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");

  const i = Math.min(hover ?? n - 1, n - 1);
  const every = n > 6 ? 2 : 1;
  const colW =
    type === "columns" ? innerW / n : n === 1 ? innerW : innerW / (n - 1);
  const bw = Math.min(48, (innerW / n) * 0.6);

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="font-medium">{labels[i]}</span>
        <span className="font-mono">{formatMetric(metric, current[i])}</span>
        <span className="text-black/50 dark:text-white/50">
          {prevLabels[i]}: {formatMetric(metric, previous[i])}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-auto w-full"
        role="img"
        aria-label={`Monthly ${metricLabel[metric].toLowerCase()} for the selected period, compared with the previous period`}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHover(null);
        }}
      >
        {[0, 1, 2, 3, 4].map((k) => {
          const v = k * step;
          return (
            <g key={k}>
              <line
                x1={L}
                x2={W - R}
                y1={y(v)}
                y2={y(v)}
                stroke="currentColor"
                strokeOpacity={0.12}
              />
              <text
                x={L - 8}
                y={y(v) + 3}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
                fillOpacity={0.5}
              >
                {formatMetric(metric, v)}
              </text>
            </g>
          );
        })}

        {labels.map((lab, k) =>
          k % every === 0 ? (
            <text
              key={lab}
              x={x(k)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              fillOpacity={0.5}
            >
              {lab}
            </text>
          ) : null
        )}

        {type !== "columns" && (
          <>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={T}
              y2={H - B}
              stroke="currentColor"
              strokeOpacity={0.25}
            />

            {type === "area" && (
              <path
                d={`${line(current)} L${x(n - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`}
                fill="currentColor"
                fillOpacity={0.08}
              />
            )}

            <path
              d={line(previous)}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.45}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <path
              d={line(current)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />

            {current.map((v, k) => (
              <circle
                key={k}
                cx={x(k)}
                cy={y(v)}
                r={k === i ? 5 : 3}
                fill="currentColor"
              />
            ))}
          </>
        )}

        {type === "columns" &&
          current.map((v, k) => (
            <g key={k}>
              <rect
                x={x(k) - bw / 2}
                y={y(v)}
                width={bw}
                height={Math.max(y(0) - y(v), 0)}
                rx={2}
                fill="currentColor"
                fillOpacity={k === i ? 1 : 0.55}
              />
              <line
                x1={x(k) - bw / 2 - 4}
                x2={x(k) + bw / 2 + 4}
                y1={y(previous[k])}
                y2={y(previous[k])}
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="3 2"
                strokeOpacity={0.7}
              />
            </g>
          ))}

        {current.map((_, k) => (
          <rect
            key={k}
            x={x(k) - colW / 2}
            y={T}
            width={colW}
            height={H - T - B}
            fill="transparent"
            onPointerEnter={() => setHover(k)}
            onClick={() => setHover(k)}
          />
        ))}
      </svg>

      <div className="mt-2 flex gap-6 text-xs text-black/50 dark:text-white/50">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 bg-black dark:bg-white" />
          This period
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-black/45 dark:border-white/45" />
          Previous period
        </span>
      </div>
    </div>
  );
}

function DonutChart({
  slices,
  selected,
  metric,
  onSelect,
  dim,
}: {
  slices: { key: string; value: number }[];
  selected: string;
  metric: Metric;
  onSelect: (key: string) => void;
  dim: Dim;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  const step = slices.length > 1 ? 0.72 / (slices.length - 1) : 0;

  const lens = slices.map((s) => (s.value / total) * C);
  const offsets = lens.map((_, idx) =>
    lens.slice(0, idx).reduce((a, b) => a + b, 0)
  );

  const opacityOf = (key: string, idx: number) =>
    selected === "All"
      ? 0.92 - idx * step
      : selected === key
        ? 0.95
        : 0.15;

  const centre =
    selected === "All"
      ? total
      : (slices.find((s) => s.key === selected)?.value ?? 0);

  const top = Math.max(...slices.map((s) => s.value), 1);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <View3D
          dim={dim}
          className="h-full w-full"
          spec={{
            kind: "donut",
            rOuter: R + 14,
            rInner: R - 14,
            track: false,
            activeKey: null,
            onSelect,
            items: slices.map((s, idx) => ({
              key: s.key,
              start: offsets[idx] / C,
              len: Math.max(lens[idx] - 2, 0) / C,
              o: opacityOf(s.key, idx),
              h: s.value / top,
            })),
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="h-48 w-48"
            role="img"
            aria-label="Donut chart showing each share of the total"
          >
            <g transform="rotate(-90 100 100)">
              {slices.map((s, idx) => {
                const drawn = Math.max(lens[idx] - 2, 0);
                return (
                  <circle
                    key={s.key}
                    cx={100}
                    cy={100}
                    r={R}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={opacityOf(s.key, idx)}
                    strokeWidth={28}
                    strokeDasharray={`${drawn} ${C - drawn}`}
                    strokeDashoffset={-offsets[idx]}
                    className="cursor-pointer transition-all duration-500"
                    onClick={() => onSelect(s.key)}
                  />
                );
              })}
            </g>
          </svg>
        </View3D>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10.5px] leading-none text-black/50 dark:text-white/50">
            {selected === "All" ? "Total" : selected}
          </span>
          <span className="mt-1.5 text-base font-semibold leading-none">
            {formatMetric(metric, centre)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1">
        {slices.map((s, idx) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => onSelect(s.key)}
              aria-pressed={selected === s.key}
              className="flex w-full items-center gap-3 py-1 text-left text-sm"
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full bg-black dark:bg-white"
                style={{ opacity: opacityOf(s.key, idx) }}
              />
              <span className="flex-1">{s.key}</span>
              <span className="font-mono text-xs">
                {formatMetric(metric, s.value)}{" "}
                <span className="text-black/40 dark:text-white/40">
                  {Math.round((s.value / total) * 100)}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Heatmap({
  cells,
  metric,
  region,
  category,
  onPick,
  dim,
}: {
  cells: Record<string, number>;
  metric: Metric;
  region: Region | "All";
  category: Category | "All";
  onPick: (r: Region, c: Category) => void;
  dim: Dim;
}) {
  const max = Math.max(...Object.values(cells), 1);

  return (
    <div>
      <View3D
        dim={dim}
        minHeight3d={470}
        spec={{
          kind: "heat",
          regions: [...REGIONS],
          categories: [...CATEGORIES],
          cells: CATEGORIES.flatMap((c) =>
            REGIONS.map((r) => {
              const v = cells[`${r}|${c}`] ?? 0;
              return {
                r,
                c,
                n: 0.08 + 0.82 * (v / max),
                text: formatMetric(metric, v),
                on: region === r && category === c,
              };
            })
          ),
          onPick: (r, c) => onPick(r as Region, c as Category),
        }}
      >
        <div className="grid grid-cols-[5.5rem_repeat(4,minmax(0,1fr))] gap-1.5 text-xs">
          <span />
          {REGIONS.map((r) => (
            <span
              key={r}
              className="pb-1 text-center text-[10px] text-black/50 sm:text-xs dark:text-white/50"
            >
              {r}
            </span>
          ))}

          {CATEGORIES.map((c) => (
            <Fragment key={c}>
              <span
                title={c}
                className="flex items-center truncate text-black/50 dark:text-white/50"
              >
                {c}
              </span>
              {REGIONS.map((r) => {
                const v = cells[`${r}|${c}`] ?? 0;
                const alpha = 0.08 + 0.82 * (v / max);
                const strong = alpha > 0.5;
                const on = region === r && category === c;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onPick(r, c)}
                    aria-pressed={on}
                    aria-label={`${r}, ${c}: ${formatMetric(metric, v)}`}
                    className={`relative flex h-11 items-center justify-center overflow-hidden rounded-lg border text-[11px] transition sm:text-xs ${
                      on
                        ? "border-black ring-2 ring-black dark:border-white dark:ring-white"
                        : "border-black/15 hover:border-black dark:border-white/20 dark:hover:border-white"
                    }`}
                  >
                    <span
                      className="absolute inset-0 bg-black dark:bg-white"
                      style={{ opacity: alpha }}
                    />
                    <span
                      className={`relative font-mono ${
                        strong
                          ? "text-white dark:text-black"
                          : "text-black dark:text-white"
                      }`}
                    >
                      {formatMetric(metric, v)}
                    </span>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </View3D>

      <div className="mt-4 flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
        <span>Low</span>
        {[0.08, 0.28, 0.48, 0.68, 0.9].map((a) => (
          <span
            key={a}
            className="inline-block h-3 w-6 rounded-sm bg-black dark:bg-white"
            style={{ opacity: a }}
          />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

export default function SalesDashboard() {
  const [region, setRegion] = useState<Region | "All">("All");
  const [category, setCategory] = useState<Category | "All">("All");
  const [period, setPeriod] = useState<Period>(6);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [breakdown, setBreakdown] = useState<"category" | "region">("category");
  const [trendType, setTrendType] = useState<TrendType>("line");
  const [view, setView] = useState<View>("bars");
  const [dim, setDim] = useState<Dim>("2d");

  const filtersActive = region !== "All" || category !== "All";

  // Monthly totals for the current region and category filters
  const monthly = useMemo(() => {
    const t = Array.from({ length: MONTHS }, () => ({
      revenue: 0,
      orders: 0,
      units: 0,
    }));
    for (const r of DATA) {
      if (region !== "All" && r.region !== region) continue;
      if (category !== "All" && r.category !== category) continue;
      t[r.month].revenue += r.revenue;
      t[r.month].orders += r.orders;
      t[r.month].units += r.units;
    }
    return t;
  }, [region, category]);

  const start = MONTHS - period;

  const sum = (from: number, len: number) =>
    monthly.slice(from, from + len).reduce(
      (a, m) => ({
        revenue: a.revenue + m.revenue,
        orders: a.orders + m.orders,
        units: a.units + m.units,
      }),
      { revenue: 0, orders: 0, units: 0 }
    );

  const cur = sum(start, period);
  const prev = sum(start - period, period);

  const change = (c: number, p: number) => (p === 0 ? null : (c - p) / p);
  const curAov = cur.orders ? cur.revenue / cur.orders : 0;
  const prevAov = prev.orders ? prev.revenue / prev.orders : 0;

  // One month would give the trend a single point, so 1M shows six for context
  const win = period === 1 ? 6 : period;
  const trendStart = MONTHS - win;
  const currentSeries = monthly.slice(trendStart).map((m) => m[metric]);
  const previousSeries = monthly
    .slice(trendStart - win, trendStart)
    .map((m) => m[metric]);
  const labels = Array.from({ length: win }, (_, k) =>
    monthLabel(trendStart + k)
  );
  const prevLabels = Array.from({ length: win }, (_, k) =>
    monthLabel(trendStart - win + k)
  );

  // Bars: apply the OTHER dimension's filter so every bar stays visible
  const bars = useMemo(() => {
    const keys: readonly string[] = breakdown === "category" ? CATEGORIES : REGIONS;
    const rows = DATA.filter(
      (r) =>
        r.month >= start &&
        (breakdown === "category"
          ? region === "All" || r.region === region
          : category === "All" || r.category === category)
    );
    return keys
      .map((k) => ({
        key: k,
        value: rows
          .filter((r) => (breakdown === "category" ? r.category : r.region) === k)
          .reduce((a, r) => a + r[metric], 0),
      }))
      .sort((a, b) => b.value - a.value);
  }, [breakdown, region, category, start, metric]);

  // Heatmap: every region and category for the chosen period and measure
  const cells = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of DATA) {
      if (r.month < start) continue;
      const key = `${r.region}|${r.category}`;
      out[key] = (out[key] ?? 0) + r[metric];
    }
    return out;
  }, [start, metric]);

  function pickCell(r: Region, c: Category) {
    if (region === r && category === c) {
      setRegion("All");
      setCategory("All");
    } else {
      setRegion(r);
      setCategory(c);
    }
  }

  const barMax = Math.max(...bars.map((b) => b.value), 1);
  const barTotal = bars.reduce((a, b) => a + b.value, 0) || 1;
  const selected: string = breakdown === "category" ? category : region;

  function toggle(key: string) {
    if (breakdown === "category") {
      setCategory((c) => (c === key ? "All" : (key as Category)));
    } else {
      setRegion((r) => (r === key ? "All" : (key as Region)));
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border border-black/15 p-6 dark:border-white/20">
        <div className="grid gap-5 sm:grid-cols-2">
          <Segmented
            label="Period"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
          <Segmented
            label="Measure"
            options={metricOptions}
            value={metric}
            onChange={setMetric}
          />
          <Segmented
            label="Region"
            options={regionOptions}
            value={region}
            onChange={setRegion}
          />
          <Segmented
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-black/50 dark:text-white/50">
          <p>
            Showing {region === "All" ? "all regions" : region} ·{" "}
            {category === "All" ? "all categories" : category} ·{" "}
            {period === 1 ? "last month" : `last ${period} months`}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setRegion("All");
                setCategory("All");
              }}
              className="underline underline-offset-4 transition hover:text-black dark:hover:text-white"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi
          label="Revenue"
          value={formatCurrency(cur.revenue)}
          delta={change(cur.revenue, prev.revenue)}
        />
        <Kpi
          label="Orders"
          value={formatCount(cur.orders)}
          delta={change(cur.orders, prev.orders)}
        />
        <Kpi
          label="Units sold"
          value={formatCount(cur.units)}
          delta={change(cur.units, prev.units)}
        />
        <Kpi
          label="Avg order value"
          value={formatCurrency(curAov)}
          delta={change(curAov, prevAov)}
        />
      </div>

      {/* Trend */}
      <div className="rounded-2xl border border-black/15 p-6 dark:border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
            Monthly {metricLabel[metric].toLowerCase()}
          </h3>
          <Segmented
            label="Chart"
            options={trendOptions}
            value={trendType}
            onChange={setTrendType}
          />
        </div>
        {period === 1 && (
          <p className="mt-3 text-xs text-black/50 dark:text-white/50">
            The last six months are shown for context. The cards and the charts
            below use the last month only.
          </p>
        )}
        <div className="mt-4">
          <TrendChart
            current={currentSeries}
            previous={previousSeries}
            labels={labels}
            prevLabels={prevLabels}
            metric={metric}
            type={trendType}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-black/15 p-6 dark:border-white/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h3 className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
            {metricLabel[metric]} {breakdown === "category" ? "by category" : "by region"}
          </h3>
          <div className="flex flex-wrap gap-5">
            <Segmented
              label="Group"
              options={breakdownOptions}
              value={breakdown}
              onChange={setBreakdown}
            />
            <Segmented
              label="View"
              options={viewOptions}
              value={view}
              onChange={setView}
            />
            <div>
              <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/50">
                Dimension
              </p>
              <div className="mt-2">
                <DimToggle value={dim} onChange={setDim} />
              </div>
            </div>
          </div>
        </div>

        {view === "bars" ? (
          <View3D
            dim={dim}
            className="mt-6"
            minHeight3d={240 + bars.length * 18}
            spec={{
              kind: "bars",
              onSelect: toggle,
              items: bars.map((b) => ({
                key: b.key,
                n: b.value / barMax,
                on: selected === "All" || selected === b.key,
                valueLabel: `${formatMetric(metric, b.value)} ${Math.round(
                  (b.value / barTotal) * 100
                )}%`,
              })),
            }}
          >
            <ul className="space-y-2">
              {bars.map((b) => {
                const on = selected === "All" || selected === b.key;
                return (
                  <li key={b.key}>
                    <button
                      type="button"
                      onClick={() => toggle(b.key)}
                      aria-pressed={selected === b.key}
                      className="group grid w-full grid-cols-[6rem_1fr_6.5rem] items-center gap-3 py-1 text-left text-sm"
                    >
                      <span>{b.key}</span>
                      <span className="h-3 rounded-full bg-black/5 dark:bg-white/10">
                        <span
                          className={`block h-3 rounded-full transition-all duration-500 ${
                            on
                              ? "bg-black dark:bg-white"
                              : "bg-black/20 group-hover:bg-black/50 dark:bg-white/25 dark:group-hover:bg-white/50"
                          }`}
                          style={{ width: `${(b.value / barMax) * 100}%` }}
                        />
                      </span>
                      <span className="text-right font-mono text-xs">
                        {formatMetric(metric, b.value)}{" "}
                        <span className="text-black/40 dark:text-white/40">
                          {Math.round((b.value / barTotal) * 100)}%
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </View3D>
        ) : (
          <div className="mt-6">
            <DonutChart
              slices={bars}
              selected={selected}
              metric={metric}
              onSelect={toggle}
              dim={dim}
            />
          </div>
        )}

        <p className="mt-4 text-xs text-black/50 dark:text-white/50">
          Click a bar or slice to filter the whole dashboard. Click it again to
          clear.
        </p>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-black/15 p-6 dark:border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
            {metricLabel[metric]} by region and category
          </h3>
          <DimToggle value={dim} onChange={setDim} />
        </div>
        <div className="mt-6">
          <Heatmap
            cells={cells}
            metric={metric}
            region={region}
            category={category}
            onPick={pickCell}
            dim={dim}
          />
        </div>
        <p className="mt-4 text-xs text-black/50 dark:text-white/50">
          Darker cells mean higher values. Click a cell to filter by that region
          and category.
        </p>
      </div>

      <p className="text-sm italic text-black/50 dark:text-white/50">
        All data on this page is synthetic.
      </p>
    </div>
  );
}