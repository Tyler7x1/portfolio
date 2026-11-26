import ProjectCard, { type Project } from "@/components/ProjectCard";
import Reveal from "@/components/Reveal"

export const metadata = {
  title: "Projects",
  description: "Independent research, a capstone project and a Python analytics project.",
};

const projects: Project[] = [
  {
    type: "Data analytics project",
    title: "Slow-Moving and Dead Stock Analysis System",
    subtitle: "An inventory analytics system built with Python",
    description:
      "A Python-based system that classifies inventory by movement, quantifies the capital tied up in slow-moving and dead stock, and generates business reports and charts. Built on a synthetic dataset simulating an electronics distributor.",
    tags: ["Python", "Pandas", "Data visualisation", "Inventory analytics"],
    href: "https://github.com/Tyler7x1/Slow-Moving-Dead-Stock-Analysis",
  },
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
  }
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
            <Reveal>
            <ProjectCard project={project} />
            </Reveal>
          </li>
        ))}
      </ul>
    </main>
  );
}