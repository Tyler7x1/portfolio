"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Project = {
  type: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  href: string;
  image?: string;
};

export default function ProjectCard({ project }: { project: Project }) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerType = useRef("mouse");
  const external = project.href.startsWith("http");

  // While revealed, a tap anywhere outside the card puts the GIF back
  useEffect(() => {
    if (!revealed) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setRevealed(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [revealed]);

  function onClick(e: React.MouseEvent) {
    // On touch screens, the first tap only reveals the description
    if (project.image && pointerType.current !== "mouse" && !revealed) {
      e.preventDefault();
      setRevealed(true);
    }
  }

  return (
    <Link
      ref={ref}
      href={project.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onPointerDown={(e) => (pointerType.current = e.pointerType)}
      onKeyDown={() => (pointerType.current = "mouse")}
      onClick={onClick}
      className={`group relative block overflow-hidden rounded-2xl border border-black/15 transition hover:border-black dark:border-white/20 dark:hover:border-white ${project.image ? "h-96" : ""
        }`}
    >
      {project.image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={`${project.title} demo`}
            className="absolute inset-0 h-full w-full object-cover" loading="lazy"
            decoding="async"
          />

          <span
            aria-hidden
            className={`absolute bottom-4 right-4 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 ${revealed ? "opacity-0" : "opacity-100"
              }`}
          >
            <span className="[@media(pointer:coarse)]:hidden">
              Hover for details
            </span>
            <span className="hidden [@media(pointer:coarse)]:inline">
              Tap for details
            </span>
          </span>
        </>
      )}

      <div
        className={
          project.image
            ? `absolute inset-0 overflow-y-auto bg-white/95 p-8 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-black/95 ${revealed ? "opacity-100" : "opacity-0"
            }`
            : "p-8"
        }
      >
        <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
          {project.type}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {project.title}
        </h2>
        <p className="mt-1 italic text-black/60 dark:text-white/60">
          {project.subtitle}
        </p>
        <p className="mt-4 leading-relaxed text-black/70 dark:text-white/70">
          {project.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-black/20 px-3 py-1 text-xs dark:border-white/30"
            >
              {tag}
            </li>
          ))}
        </ul>

        <span className="mt-6 inline-block text-sm font-medium transition group-hover:translate-x-1">
          View Page →
        </span>
      </div>
    </Link>
  );
}