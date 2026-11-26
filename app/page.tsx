import Link from "next/link";
import DashboardPreview from "@/components/DashboardPreview";
import IntroController from "@/components/IntroController";
import FindingsCarousel from "@/components/FindingsCarousel";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";

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
      <section className="mt-10">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="intro-word intro-1 inline-block">Hi.</span>{" "}
          <span className="intro-word intro-2 inline-block">I&apos;m Jay.</span>{" "}
          <span className="intro-word intro-3 inline-block text-black/40 dark:text-white/40">
            Glad you&apos;re here.
          </span>
        </h1>
        <p className="intro-rest mt-6 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
          I like learning about things I&apos;m curious about, and the more I
          learn, the more curious I get. I wanna figure out how
          technology shapes an organization and how businesses actually run.
        </p>
        <p className="intro-rest mt-4 max-w-2xl text-lg leading-relaxed text-black/60 dark:text-white/60">
          <strong className="font-semibold text-black dark:text-white">Business</strong>{" "}
          is the what: capital, people, decisions.{" "}
          <strong className="font-semibold text-black dark:text-white">Informatics</strong>{" "}
          is how it all stays informed. Put them together and that&apos;s the
          space I wanna work in.
        </p>
      </section>

      {/* Resume */}
      <div className="intro-rest mt-12 flex justify-center">
        <a
          href="/cv.pdf"
          download="Jayprakash_Malik_CV.pdf"
          className="inline-flex items-center gap-3 rounded-full border border-black bg-black px-10 py-4 text-base font-semibold text-white transition duration-300 hover:bg-transparent hover:text-black motion-safe:hover:-translate-y-1 dark:border-white dark:bg-white dark:text-black dark:hover:bg-transparent dark:hover:text-white"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
          </svg>
          Download CV
        </a>
      </div>

      {/* Featured articles */}
      <section className="intro-rest mt-20">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Featured articles
        </h2>
        <div className="mt-4 space-y-6">
          {/* Article */}
          <Link
            href="/blog/python-fundamentals-business-analytics"
            className="group grid gap-8 rounded-2xl border border-black/15 p-6 transition duration-300 hover:-translate-y-1 hover:border-black sm:grid-cols-5 sm:p-8 dark:border-white/20 dark:hover:border-white"
          >
            <div className="sm:col-span-3">
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Python for Business Analytics
              </h3>
              <p className="mt-1 italic text-black/60 dark:text-white/60">
                How Much Programming Does a Business Analyst Really Need?
              </p>
              <p className="mt-4 leading-relaxed text-black/70 dark:text-white/70">
                My notes on which Python fundamentals are worth learning for
                Business Informatics, and what to learn beyond them, with an
                interactive demo.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
                <span className="inline-block transition group-hover:translate-x-1">
                  Read the article→
                </span>
              </span>
            </div>

            <div aria-hidden className="self-center sm:col-span-2">
              <div className="overflow-hidden rounded-xl bg-black/5 py-3 dark:bg-white/10">
                <pre className="font-mono text-[11px] leading-6">
                  <code>
                    {snippet.map((line, i) => (
                      <div
                        key={i}
                        className={`px-4 ${line.on
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
          </Link>
        </div>

        <div className="mt-4 space-y-6">
          <div className="rounded-2xl border border-black/15 p-6 sm:p-8 dark:border-white/20">
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
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
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
            >
              <span className="inline-block transition group-hover:translate-x-1">
                Read the full study→
              </span>
            </Link>
          </div>

        </div>
      </section>
      <section className="intro-rest mt-20">
        <h2 className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
          Interactive demo
        </h2>
        <div className="mt-4">
          <Reveal>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>
      <div className="intro-rest mt-20">
        <Reveal>
          <ExploreMore />
        </Reveal>
      </div>
    </main>
  );
}