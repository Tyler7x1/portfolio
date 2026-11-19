"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const found = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("article h2")
    ).map((el) => {
      const text = el.textContent ?? "";
      if (!el.id) el.id = slugify(text);
      return { id: el.id, text };
    });
    setHeadings(found);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Contents"
      className="mt-10 rounded-2xl border border-black/15 p-6 dark:border-white/20"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
        Contents
      </p>
      <ol className="mt-4 space-y-2">
        {headings.map((heading, i) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="flex gap-4 text-sm text-black/70 transition hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              <span className="tabular-nums text-black/40 dark:text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}