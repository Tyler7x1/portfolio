export const REGIONS = ["North", "South", "East", "West"] as const;
export const CATEGORIES = [
  "Laptops",
  "Phones",
  "Tablets",
  "Audio",
  "Wearables",
  "Gaming",
  "Smart Home",
  "Accessories",
] as const;

export type Region = (typeof REGIONS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Metric = "revenue" | "orders" | "units";

export type Row = {
  month: number; // 0 = Nov 2024 ... 23 = Oct 2026
  region: Region;
  category: Category;
  revenue: number;
  orders: number;
  units: number;
};

export const MONTHS = 24;

// A small seeded random number generator, so the dummy data is
// identical on every visit and on the server and the browser.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Profile = {
  revenue: number; // typical monthly revenue per region, in dollars
  price: number; // typical unit price, in dollars
  growth: number; // monthly growth rate (negative means declining)
  amp: number; // how strongly the category follows the yearly season
  basket: number; // typical units per order
  boostMonths: number[]; // extra demand months (0 = Jan)
  boost: number; // size of that extra demand
};

const PROFILE: Record<Category, Profile> = {
  Laptops: { revenue: 180000, price: 850, growth: 0.01, amp: 0.4, basket: 1.05, boostMonths: [7, 8], boost: 0.3 },
  Phones: { revenue: 220000, price: 500, growth: 0.006, amp: 0.8, basket: 1.05, boostMonths: [8, 9], boost: 0.35 },
  Tablets: { revenue: 90000, price: 450, growth: -0.004, amp: 0.6, basket: 1.05, boostMonths: [10, 11], boost: 0.15 },
  Audio: { revenue: 60000, price: 90, growth: 0.012, amp: 1.0, basket: 1.15, boostMonths: [10, 11], boost: 0.25 },
  Wearables: { revenue: 50000, price: 180, growth: 0.028, amp: 0.9, basket: 1.1, boostMonths: [11, 0], boost: 0.3 },
  Gaming: { revenue: 70000, price: 320, growth: 0.015, amp: 1.2, basket: 1.2, boostMonths: [10, 11], boost: 0.45 },
  "Smart Home": { revenue: 40000, price: 75, growth: 0.02, amp: 0.5, basket: 1.3, boostMonths: [3, 4], boost: 0.2 },
  Accessories: { revenue: 30000, price: 25, growth: 0.004, amp: 0.7, basket: 1.8, boostMonths: [], boost: 0 },
};

const regionWeight: Record<Region, number> = {
  North: 1.1,
  South: 1.0,
  East: 0.85,
  West: 1.05,
};

// Regions also grow at slightly different speeds
const regionGrowth: Record<Region, number> = {
  North: 0,
  South: 0.004,
  East: -0.002,
  West: 0.002,
};

// Jan to Dec: quieter early in the year, festive peak in Oct and Nov
const seasonal = [0.9, 0.85, 0.95, 1.0, 1.0, 0.95, 1.0, 1.05, 1.1, 1.3, 1.35, 1.15];

export const DATA: Row[] = (() => {
  const rand = mulberry32(2026);
  const rows: Row[] = [];

  for (let m = 0; m < MONTHS; m++) {
    const moy = (m + 10) % 12; // month of year, 0 = Jan

    for (const region of REGIONS) {
      for (const category of CATEGORIES) {
        const p = PROFILE[category];

        const season =
          1 +
          (seasonal[moy] - 1) * p.amp +
          (p.boostMonths.includes(moy) ? p.boost : 0);
        const trend = Math.max(0.3, 1 + m * (p.growth + regionGrowth[region]));

        // Occasional disruptions (dips) and promotions (spikes)
        const roll = rand();
        const shock =
          roll < 0.05
            ? 0.65 + rand() * 0.15
            : roll > 0.95
              ? 1.25 + rand() * 0.2
              : 1;
        const noise = 0.8 + rand() * 0.4;

        const revenue =
          Math.round(
            (p.revenue * regionWeight[region] * season * trend * shock * noise) /
              100
          ) * 100;

        // Electronics get a little cheaper over time
        const price = p.price * (1 - 0.004 * m) * (0.95 + rand() * 0.1);
        const units = Math.max(1, Math.round(revenue / price));
        const orders = Math.max(
          1,
          Math.round(units / (p.basket * (1 + rand() * 0.4)))
        );

        rows.push({ month: m, region, category, revenue, orders, units });
      }
    }
  }

  return rows;
})();

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthLabel(m: number) {
  const name = MONTH_NAMES[(m + 10) % 12];
  const year = 2024 + Math.floor((m + 10) / 12);
  return `${name} ${String(year).slice(2)}`;
}

export function formatCurrency(n: number) {
  if (n >= 1e6) return `$${Number((n / 1e6).toFixed(2))}M`;
  if (n >= 1e3) return `$${Number((n / 1e3).toFixed(1))}K`;
  return `$${Math.round(n)}`;
}

export function formatCount(n: number) {
  if (n >= 1000) return `${Number((n / 1000).toFixed(1))}K`;
  return String(Math.round(n));
}

export function formatMetric(metric: Metric, n: number) {
  return metric === "revenue" ? formatCurrency(n) : formatCount(n);
}