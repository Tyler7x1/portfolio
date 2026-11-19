import Link from "next/link";
import FindingsCarousel from "@/components/FindingsCarousel";
import IntroController from "@/components/IntroController";

const education = [
  {
    years: "2022 - 2025",
    title: "Bachelor of Computer Applications (BCA)",
    place: "Presidency University, Bengaluru",
  },
  {
    years: "2022",
    title: "Class XII · ISC (Indian School Certificate)",
    place: "St. Vincent's Convent Senior Secondary School",
  },
  {
    years: "2020",
    title: "Class X · ICSE (Indian Certificate of Secondary Education)",
    place: "St. Vincent's Convent Senior Secondary School",
  },
];

const skills = [
  {
    group: "Core",
    items: ["Python", "SQL", "Microsoft Excel", "C", "Javascript"],
  },
  {
    group: "Also familiar with",
    items: ["Microsoft Office", "Linux", "Java"],
  },
];

const snippet = [
  { text: "elif days < 7:", on: true },
  { text: '    return "Reorder now"', on: true },
  { text: "elif days < 14:", on: false },
  { text: '    return "Monitor"', on: false },
  { text: "else:", on: false },
  { text: '    return "Sufficient"', on: false },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <IntroController />

      {/* Intro */}
      <section>
        <p className="intro-rest text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          BCA Graduate · Aspiring Business Informatics Student
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="intro-word intro-1 inline-block">Business.</span>{" "}
          <span className="intro-word intro-2 inline-block">Technology.</span>{" "}
          <span className="intro-word intro-3 inline-block text-black/40 dark:text-white/40">
            Why not both?
          </span>
        </h1>
        <p className="intro-rest mt-6 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
          I&apos;m a Bachelor of Computer Applications graduate. I&apos;m interested in how organisations and information systems work together to support managerial decisions and ensure smooth and seamless business operations.
        </p>
      </section>

      {/* Featured Articles */}
      <section className="intro-rest mt-20">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Featured Articles
        </h2>
         <div className="mt-4 grid gap-8 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Python for Business Analytics
            </h3>
            <p className="mt-1 italic text-black/60 dark:text-white/60">
              How Much Programming Does a Business Analyst Really Need?
            </p>
            <p className="mt-4 leading-relaxed text-black/70 dark:text-white/70">
              My thoughts on which Python fundamentals are worth learning for
              Business Informatics, and what to learn beyond them, with an
              interactive demo.
            </p>
            <Link
              href="/blog/python-fundamentals-business-analytics"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
            >
              <span className="inline-block transition group-hover:translate-x-1">
                Read the article →
              </span>
            </Link>
          </div>

          <div aria-hidden className="self-center sm:col-span-2">
            <div className="overflow-hidden rounded-xl bg-black/5 py-3 dark:bg-white/10">
              <pre className="font-mono text-[11px] leading-6">
                <code>
                  {snippet.map((line, i) => (
                    <div
                      key={i}
                      className={`px-4 ${
                        line.on
                          ? "bg-black/10 dark:bg-white/20"
                          : "text-black/40 dark:text-white/40"
                      }`}
                    >
                      {line.text}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">
          Behind the Storefront
        </h3>
        <p className="mt-1 italic text-black/60 dark:text-white/60">
          An independent exploratory study of clothing retail operations
        </p>

        <div className="mt-8">
          <FindingsCarousel />
        </div>

        <Link
          href="/blog/behind-the-storefront"
          className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
        >
          <span className="inline-block transition group-hover:translate-x-1">
            Read the full study →
          </span>
        </Link>
      </section>

      {/* Education */}
      <section className="intro-rest mt-20">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Education
        </h2>

        <ol className="mt-6 border-l border-black/15 dark:border-white/20">
          {education.map((item) => (
            <li key={item.title} className="relative pb-10 pl-8 last:pb-0">
              <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-black dark:bg-white" />
              <p className="text-sm text-black/50 dark:text-white/50">
                {item.years}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-black/70 dark:text-white/70">{item.place}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Skills */}
      <section className="intro-rest mt-20">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Skills
        </h2>

        <div className="mt-6 space-y-8">
          {skills.map((group) => (
            <div key={group.group}>
              <p className="text-sm text-black/50 dark:text-white/50">
                {group.group}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="cursor-default rounded-full border border-black/20 px-4 py-1.5 text-sm transition duration-300 hover:border-black hover:bg-black hover:text-white motion-safe:hover:-translate-y-1 dark:border-white/30 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}