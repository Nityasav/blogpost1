import { Suspense } from "react";
import { BlogGeneratorClient } from "@/components/blog-generator/blog-generator-client";

const highlights = [
  {
    title: "Client-ready clarity",
    copy: "Structured briefs and TL;DR summaries keep reviews under five minutes.",
  },
  {
    title: "Live source control",
    copy: "Exa, Unsplash, and internal data stay referenced, cited, and linkable.",
  },
  {
    title: "Ops friendly",
    copy: "Exports drop into CMS or Docs without additional formatting passes.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 md:pt-20 lg:px-10">
      <header className="reveal space-y-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#2A33A4]/20 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2A33A4]">
          SEO · GEO · PRODUCTION
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight text-[#2A33A4] md:text-5xl">
            Formal publishing, delivered with a single prompt.
          </h1>
          <p className="max-w-2xl text-base text-[#2A33A4]/80">
            Pair enterprise briefs with a restrained toolset. Generate geo-personalized narratives, citations, and imagery in one pass, then handoff to stakeholders without design polish.
          </p>
        </div>
        <ul className="grid gap-4 text-sm text-[#2A33A4]/80 md:grid-cols-3">
          {highlights.map((highlight) => (
            <li key={highlight.title} className="surface-panel border-[#2A33A4]/15 bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2A33A4]/60">
                {highlight.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#2A33A4]/80">
                {highlight.copy}
              </p>
            </li>
          ))}
        </ul>
      </header>

      <Suspense
        fallback={
          <div className="reveal reveal-delay-2 grid gap-4 rounded-3xl border border-[#2A33A4]/20 bg-white/75 p-10">
            <div className="h-6 w-40 animate-pulse rounded-full bg-[#2A33A4]/10" />
            <div className="h-24 animate-pulse rounded-3xl bg-[#2A33A4]/10" />
          </div>
        }
      >
        <div className="reveal reveal-delay-2">
          <BlogGeneratorClient />
        </div>
      </Suspense>
    </main>
  );
}
