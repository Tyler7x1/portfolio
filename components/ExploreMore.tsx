"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/demos",
    label: "Demos",
    title: "Try the sales dashboard",
    text: "An interactive dashboard on dummy data. Filter, switch charts and click to drill down.",
  },
  {
    href: "/projects",
    label: "Projects",
    title: "See the projects",
    text: "View the projects I've created.",
  },
  {
    href: "/blog",
    label: "Blog",
    title: "Read the articles",
    text: "Visit my blog page",
  },
  {
    href: "/about",
    label: "About",
    title: "Education and skills",
    text: "My background, qualifications and the tools I use.",
  },
];

export default function ExploreMore({
  heading = "Keep exploring",
}: {
  heading?: string;
}) {
  const pathname = usePathname();
  // Never offer a link to the page the visitor is already on
  const links = items.filter((item) => item.href !== pathname);

  return (
    <section aria-label="More to explore">
      <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
        {heading}
      </h2>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex h-full flex-col rounded-2xl border border-black/15 p-6 transition duration-300 hover:-translate-y-1 hover:border-black dark:border-white/20 dark:hover:border-white"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
                {item.label}
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                {item.title}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
                {item.text}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}