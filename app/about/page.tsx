export const metadata = {
  title: "About",
};

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
    items: ["Python", "SQLite", "Microsoft Excel", "C"],
  },
  {
    group: "Also familiar with",
    items: ["HTML", "CSS", "JavaScript"],
  },
];

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
        I&apos;m a Bachelor of Computer Applications graduate from Presidency
        University, Bengaluru, preparing to apply for a Master&apos;s degree in
        Business Informatics abroad.
      </p>

      {/* Education */}
      <section className="mt-16">
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
      <section className="mt-16">
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