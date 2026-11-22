import SalesDashboard from "@/components/SalesDashboard";

export const metadata = {
  title: "Demos",
};

export default function Demos() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight">Demo</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
        Small interactive dashboard you can try.
      </p>

      <section className="mt-12">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Sales dashboard
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-black/70 dark:text-white/70">
          A dashboard built on dummy data for a fictional electronics retailer.
          Filter by region, category and period, switch the measure, and click a
          bar to drill down.
        </p>

        <div className="mt-8">
          <SalesDashboard />
        </div>
      </section>
    </main>
  );
}