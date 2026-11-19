"use client";

import { useEffect, useRef, useState } from "react";

const labels = {
  manager: "Manager's account",
  interpretation: "My interpretation",
  uncertain: "Uncertain",
};

export default function Callout({
  type = "manager",
  children,
}: {
  type?: keyof typeof labels;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const uncertain = type === "uncertain";

  return (
    <aside
      ref={ref}
      className="not-prose relative mb-2 mr-3 mt-6 inline-block align-top"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
          setOpen((o) => !o);
        }}
        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition ${
          uncertain ? "border-dashed" : ""
        } ${
          open
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-black/30 text-black/60 hover:border-black hover:text-black dark:border-white/40 dark:text-white/60 dark:hover:border-white dark:hover:text-white"
        }`}
      >
        {labels[type]}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 w-[min(24rem,calc(100vw-3rem))] pt-2">
          <div
            role="note"
            className={`rounded-xl border bg-white p-5 text-sm leading-relaxed text-black/80 shadow-lg dark:bg-black dark:text-white/80 ${
              uncertain
                ? "border-dashed border-black/40 dark:border-white/50"
                : "border-black/20 dark:border-white/30"
            }`}
          >
            {children}
          </div>
        </div>
      )}
    </aside>
  );
}