import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/demos", label: "Demos" },
  { href: "/blog", label: "Blog" },
];

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center">
      <p className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-black/60 dark:text-white/60">
        The link may be old, or the address may have a typo. These pages are a
        good place to start.
      </p>

      <ul className="mt-10 flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block rounded-full border border-black/20 px-5 py-2 text-sm transition hover:bg-black hover:text-white dark:border-white/30 dark:hover:bg-white dark:hover:text-black"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}