"use client";

import { createContext, useContext, useState } from "react";

export type Dim = "2d" | "3d";

const DimContext = createContext<{ dim: Dim; setDim: (d: Dim) => void }>({
  dim: "2d",
  setDim: () => {},
});

// Lets a toggle and a chart share one 2D/3D state, even when the
// chart sits inside a server component tree.
export function DimProvider({ children }: { children: React.ReactNode }) {
  const [dim, setDim] = useState<Dim>("2d");
  return (
    <DimContext.Provider value={{ dim, setDim }}>{children}</DimContext.Provider>
  );
}

export function useDim() {
  return useContext(DimContext);
}

export function DimToggle({
  value,
  onChange,
}: {
  value: Dim;
  onChange: (d: Dim) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Chart dimension"
      className="inline-flex rounded-full border border-black/20 p-0.5 text-xs dark:border-white/30"
    >
      {(["2d", "3d"] as const).map((d) => {
        const on = value === d;
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(d)}
            className={`rounded-full px-3 py-1 transition ${
              on
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            }`}
          >
            {d.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

// Same toggle, wired to the nearest DimProvider
export function ContextDimToggle() {
  const { dim, setDim } = useDim();
  return <DimToggle value={dim} onChange={setDim} />;
}