import ProjectCard, { type Project } from "@/components/ProjectCard";

const projects: Project[] = [
  {
    type: "Independent research",
    title: "Behind the Storefront",
    subtitle: "An Exploratory Study of Clothing Retail Operations",
    description:
      "A field-based investigation into how a clothing retail store runs behind the scenes, based on a semi-structured interview with its Store Manager.",
    tags: [
      "Qualitative interviewing",
      "Business process analysis",
      "Enterprise systems",
      "Process diagrams",
    ],
    href: "/blog/behind-the-storefront",
  },
  {
    type: "Capstone Project",
    title: "Echo Relay",
    subtitle: "Final Year Project for my Undergraduate Degree",
    description:
      "A file sharing web application with a combined upload limit of 7 GB, with files automatically expiring after 7 days.",
    tags: [
      "CRUD Operations",
      "Responsive Web Design",
      "API Integration",
      "FullStack Development",
    ],
    href: "https://github.com/theoneandonlyshadow/Echo-Relay",
    image: "/echorelay.gif",
  },
];

export default function Projects() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
        A showcase of my work.
      </p>

      <ul className="mt-12 space-y-6">
        {projects.map((project) => (
          <li key={project.title}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </main>
  );
}