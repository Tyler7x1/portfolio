import type { IconType } from "react-icons";
import Reveal from "@/components/Reveal";
import * as Fa6 from "react-icons/fa6";
import * as Si from "react-icons/si";

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

type IconName =
  | "terminal"
  | "database"
  | "spreadsheet"
  | "chip"
  | "code"
  | "layout"
  | "braces";

type Skill = { name: string; logos: string[]; icon: IconName };

const skills: { group: string; items: Skill[] }[] = [
  {
    group: "Core",
    items: [
      { name: "Python", logos: ["SiPython"], icon: "terminal" },
      { name: "SQL", logos: ["FaDatabase"], icon: "database" },
      {
        name: "Microsoft Excel",
        logos: ["SiMicrosoftexcel", "FaFileExcel"],
        icon: "spreadsheet",
      },
      { name: "C", logos: ["SiC"], icon: "chip" },
    ],
  },
  {
    group: "Also familiar with",
    items: [
      { name: "HTML", logos: ["SiHtml5"], icon: "code" },
      { name: "CSS", logos: ["SiCss3", "SiCss"], icon: "layout" },
      { name: "JavaScript", logos: ["SiJavascript"], icon: "braces" },
    ],
  },
];

function SkillIcon({ name }: { name: IconName }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "terminal":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 10 3 3-3 3M12 16h5" />
        </svg>
      );
    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      );
    case "spreadsheet":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M3 15h18M10 4v16" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" />
        </svg>
      );
    case "layout":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M9 9v11" />
        </svg>
      );
    case "braces":
      return (
        <svg {...common}>
          <path d="M8 4C6 4 5 5 5 7v2c0 1.3-1 2.5-2 3 1 .5 2 1.7 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.3 1 2.5 2 3-1 .5-2 1.7-2 3v2c0 2-1 3-3 3" />
        </svg>
      );
  }
}

const allIcons = { ...Si, ...Fa6 } as unknown as Record<
  string,
  IconType | undefined
>;

function SkillLogo({
  logos,
  fallback,
}: {
  logos: string[];
  fallback: IconName;
}) {
  for (const name of logos) {
    const Logo = allIcons[name];
    if (Logo) return <Logo size={22} aria-hidden />;
  }
  return <SkillIcon name={fallback} />;
}

const interests = [
  {
    title: "Data Analytics",
    description:
      "Exploring data to identify patterns, uncover insights, and support informed decision-making.",
  },
  {
    title: "Business Intelligence",
    description:
      "Understanding how data can help businesses monitor performance and make strategic decisions.",
  },
  {
    title: "Enterprise Information Systems",
    description:
      "Learning how information systems support business operations, workflows, and organizational processes.",
  },
  {
    title: "Database Management",
    description:
      "Working with structured data, relational databases, and efficient ways of managing information.",
  },
];

const exploring = [
  "Python for data analysis",
  "SQL and database querying",
  "Data visualization and reporting",
  "Business processes and enterprise systems",
];

const sectionHeading =
  "text-sm uppercase tracking-widest text-black/50 dark:text-white/50";

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>

      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
        I&apos;m a Bachelor of Computer Applications graduate from Presidency
        University, Bengaluru. My work so far combines informal field research
        on business operations, Python-based analytics and an interest
        in enterprise information systems.
      </p>

      {/* Education */}
      <Reveal>
        <section className="mt-16">
          <h2 className={sectionHeading}>Education</h2>

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
      </Reveal>

      {/* Areas of Interest */}
      <Reveal>
        <section className="mt-16">
          <h2 className={sectionHeading}>Areas of Interest</h2>

          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {interests.map((item) => (
              <div key={item.title}>
                <h3 className="font-medium tracking-tight">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-black/55 dark:text-white/55">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Currently Exploring */}
      <Reveal>
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <h2 className={sectionHeading}>What I&apos;m currently learning</h2>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-100" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/60 dark:text-white/60">
            Always curious and continuously learning. Here are a few
            areas I&apos;m currently spending time exploring and developing
            my understanding of.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {exploring.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-black/15 px-3 py-2 text-sm text-black/70 transition-colors hover:border-black/50 dark:border-white/20 dark:text-white/70 dark:hover:border-white/50"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Skills */}
      <Reveal>
        <section className="mt-16">
          <h2 className={sectionHeading}>Skills</h2>

          <div className="mt-6 space-y-8">
            {skills.map((group) => (
              <div key={group.group}>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {group.group}
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex cursor-default items-center gap-3 rounded-xl border border-black/20 px-4 py-3 text-sm transition duration-300 hover:border-black hover:bg-black hover:text-white motion-safe:hover:-translate-y-1 dark:border-white/30 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                    >
                      <SkillLogo logos={item.logos} fallback={item.icon} />
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  );
}