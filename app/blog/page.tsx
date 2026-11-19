import Link from "next/link";
import { getPosts, formatDate } from "@/lib/posts";

export default async function Blog() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
        One post, one experience.
      </p>

      <ul className="mt-12 border-t border-black/15 dark:border-white/20">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="border-b border-black/15 dark:border-white/20"
          >
            <Link href={`/blog/${post.slug}`} className="group block py-8">
              <p className="text-sm text-black/50 dark:text-white/50">
                {formatDate(post.date)}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {post.title}
              </h2>
              {post.subtitle && (
                <p className="mt-1 italic text-black/60 dark:text-white/60">
                  {post.subtitle}
                </p>
              )}
              <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">
                {post.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium transition group-hover:translate-x-1">
                Read article →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}