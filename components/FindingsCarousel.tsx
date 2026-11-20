"use client";

import { useEffect, useRef, useState } from "react";

const findings = [
  {
    label: "The journey",
    title: "Six stages before the shelf",
    text: "Goods pass from Gate Entry through the GRC, DC, warehouses and compartments before they reach the shop floor.",
  },
  {
    label: "Display",
    title: "A written plan for every floor",
    text: "The Department Manager prepares the planogram, and the Store Manager checks the floor against it.",
  },
  {
    label: "Stock ageing",
    title: "L → M → C",
    text: "Unsold clothing moves through three categories, getting cheaper at each stage.",
  },
  {
    label: "Approvals",
    title: "One discount, five steps",
    text: "A price change passes through three roles before it takes effect.",
  },
  {
    label: "Quality control",
    title: "Villain Articles",
    text: "Defective products are reported up four levels, then filmed as evidence for the supplier.",
  },
  {
    label: "People",
    title: "Seven levels of responsibility",
    text: "From shop-floor employees to higher management, each floor has its own department structure.",
  },
  {
    label: "Returns",
    title: "The system has the final say",
    text: "The billing system decides return eligibility, and the Store Manager cannot override it.",
  },
  {
    label: "Subscriptions",
    title: "Silver, Gold and Platinum",
    text: "Yearly customer tiers, with discounts applied automatically at billing.",
  },
  {
    label: "Technology",
    title: "SAP at the centre",
    text: "One SAP-based system appeared in approvals, targets, subscriptions and reporting.",
  },
];

const STEP = 304; // one card (288px) plus the gap (16px)
const SPEED = 0.045; // pixels per millisecond; lower is slower

function Card({ item }: { item: (typeof findings)[number] }) {
  return (
    <li className="flex w-72 shrink-0">
      <div className="flex w-full flex-col rounded-2xl border border-black/15 bg-black/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-black dark:border-white/20 dark:bg-white/[0.06] dark:hover:border-white">
        <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
          {item.label}
        </p>
        <p className="mt-3 text-lg font-semibold tracking-tight">
          {item.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/60">
          {item.text}
        </p>
      </div>
    </li>
  );
}

const arrowClass =
  "pointer-events-none absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-white text-black opacity-0 shadow-sm transition hover:bg-black hover:text-white group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 sm:flex dark:border-white/30 dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black";

export default function FindingsCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [loop, setLoop] = useState(true);

  // Visitors who prefer reduced motion get a plain scrollable row
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLoop(false);
    }
  }, []);

  // Automatic scrolling
  useEffect(() => {
    const el = scroller.current;
    if (!el || !loop) return;

    let frame = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    let wasPaused = true;

    function tick(now: number) {
      const node = el as HTMLDivElement;
      const dt = Math.min(now - last, 50);
      last = now;
      const half = node.scrollWidth / 2;

      if (paused.current) {
        pos = node.scrollLeft;
        wasPaused = true;
        if (pos >= half) {
          pos -= half;
          node.scrollLeft = pos;
        }
      } else {
        if (wasPaused) {
          pos = node.scrollLeft;
          wasPaused = false;
        }
        pos += dt * SPEED;
        if (pos >= half) pos -= half;
        node.scrollLeft = pos;
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loop]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function pause() {
    clearTimeout(timer.current);
    paused.current = true;
  }

  function resume(delay = 0) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      paused.current = false;
    }, delay);
  }

  function nudge(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    // Going left from the very start: jump to the identical second copy first
    if (loop && direction === -1 && el.scrollLeft - STEP < 0) {
      el.scrollLeft += el.scrollWidth / 2;
    }
    el.scrollBy({ left: direction * STEP, behavior: "smooth" });
  }

  return (
    <div
      className="group relative"
      onMouseEnter={pause}
      onMouseLeave={() => resume()}
      onFocus={pause}
      onBlur={() => resume()}
      onTouchStart={pause}
      onTouchEnd={() => resume(2500)}
    >
      <div ref={scroller} className="carousel">
        <div className="flex w-max">
          <ul className="flex gap-4 pr-4">
            {findings.map((item) => (
              <Card key={item.title} item={item} />
            ))}
          </ul>
          {loop && (
            <ul aria-hidden className="flex gap-4 pr-4">
              {findings.map((item) => (
                <Card key={item.title} item={item} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label="Previous findings"
        className={`${arrowClass} left-2`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label="Next findings"
        className={`${arrowClass} right-2`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}