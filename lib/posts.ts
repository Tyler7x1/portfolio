import fs from "node:fs";
import path from "node:path";

export type PostMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  date: string;
};

export async function getPosts(): Promise<PostMeta[]> {
  const dir = path.join(process.cwd(), "content");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { metadata } = await import(`@/content/${slug}.mdx`);
      return { slug, ...metadata } as PostMeta;
    })
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getReadingTime(slug: string) {
  const file = path.join(process.cwd(), "content", `${slug}.mdx`);
  const text = fs.readFileSync(file, "utf8");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}