"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/15 dark:bg-black/80">
      <header className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-y-4 px-6 py-4">
        <Link href="/" className="text-sm font-medium tracking-wide">
          Jayprakash Malik
        </Link>

        <nav className="order-last flex w-full gap-6 text-sm sm:order-none sm:w-auto">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "underline underline-offset-4"
                    : "text-black/60 transition hover:text-black dark:text-white/60 dark:hover:text-white"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </header>
    </div>
  );
}