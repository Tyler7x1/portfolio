import Link from "next/link";
import { getPosts, formatDate, getReadingTime } from "@/lib/posts";
import TableOfContents from "@/components/TableOfContents";
import ReadingProgress from "@/components/ReadingProgress";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata } = await import(`@/content/${slug}.mdx`);
  return { title: metadata.title, description: metadata.description };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Content, metadata } = await import(`@/content/${slug}.mdx`);
  const minutes = getReadingTime(slug);

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <ReadingProgress />
      <Link
        href="/blog"
        className="text-sm text-black/60 transition hover:text-black dark:text-white/60 dark:hover:text-white"
      >
        ← All articles
      </Link>

      <header className="mt-10 border-b border-black/15 pb-10 dark:border-white/20">
        {metadata.category && (
          <p className="text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50">
            {metadata.category}
          </p>
        )}
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {metadata.title}
        </h1>
        {metadata.subtitle && (
          <p className="mt-5 text-xl italic leading-snug text-black/60 sm:text-2xl dark:text-white/60">
            {metadata.subtitle}
          </p>
        )}
        <p className="mt-8 text-sm text-black/50 dark:text-white/50">
          {formatDate(metadata.date)} · {minutes} min read
        </p>
      </header>

      <TableOfContents />

      <article className="prose prose-neutral mt-12 max-w-none dark:prose-invert prose-headings:tracking-tight prose-h2:mt-14">
        <Content />
      </article>
    </main>
  );
}