import Link from "next/link";
import { CATEGORIES, DATA, MONTHS } from "@/lib/dashboardData";
import DonutChart, { type Segment } from "@/components/DonutChart";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

const sum = (rows: typeof DATA) => rows.reduce((a, r) => a + r.revenue, 0);

export default function DashboardPreview() {
  const recent = DATA.filter((r) => r.month >= MONTHS - 12);
  const previous = DATA.filter(
    (r) => r.month >= MONTHS - 24 && r.month < MONTHS - 12
  );
  const total = sum(recent);
  const growth = ((total / sum(previous) - 1) * 100).toFixed(1);

  const ranked = CATEGORIES.map((name) => ({
    name: name as string,
    revenue: sum(recent.filter((r) => r.category === name)),
  })).sort((a, b) => b.revenue - a.revenue);

  const GAP = 0.8;
  let start = 0;
  const segments: Segment[] = ranked.map((c, i) => {
    const share = (c.revenue / total) * 100;
    const segment = {
      name: c.name,
      share,
      start,
      len: Math.max(share - GAP, 0.1),
      opacity: 1 - i * (0.8 / (ranked.length - 1)),
    };
    start += share;
    return segment;
  });

  return (
    <Link
      href="/demo"
      className="group block rounded-2xl border border-black/15 p-6 transition duration-300 hover:-translate-y-1 hover:border-black sm:p-8 dark:border-white/20 dark:hover:border-white"
    >
      <h3 className="text-2xl font-semibold tracking-tight">Sales dashboard</h3>
      <p className="mt-1 italic text-black/60 dark:text-white/60">
        Filter, switch charts and drill down, all on synthetic data
      </p>

      <div className="mt-8">
        <DonutChart segments={segments} total={money(total)} />
      </div>

      <p className="mt-6 text-sm text-black/60 dark:text-white/60">
        Revenue is{" "}
        <span className="font-medium text-black dark:text-white">
          {Number(growth) >= 0 ? "+" : ""}
          {growth}%
        </span>{" "}
        vs the 12 months before.
      </p>
      <p className="mt-2 text-xs text-black/50 dark:text-white/50">
        Dummy data for a fictional electronics retailer.
      </p>
      <span className="mt-3 inline-block text-sm font-medium transition group-hover:translate-x-1">
        Try the dashboard →
      </span>
    </Link>
  );
}