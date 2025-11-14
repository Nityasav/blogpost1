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

const timeline = [
  {
    stage: "Connect Claude",
    detail: "Tone calibration + dataset alignment",
  },
  {
    stage: "Select locale",
    detail: "Regionally-aware title & SEO scaffolding",
  },
  {
    stage: "Ship draft",
    detail: "Citations, FAQ, imagery, and CTA packaged",
  },
];

const metrics = [
  { label: "Avg. turnaround", value: "2m 45s" },
  { label: "Approval rate", value: "96%" },
  { label: "Coverage", value: "45 markets" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 md:pt-20 lg:px-10">
      <header className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="reveal space-y-10">
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
        </div>

        <div className="reveal reveal-delay-1 space-y-6">
          <div className="surface-panel border-[#2A33A4]/20 bg-white/90 p-8">
            <div className="flex items-center justify-between text-sm text-[#2A33A4]/70">
              <span>Status board</span>
              <span>Updated live</span>
            </div>
            <div className="mt-6 grid gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-[#2A33A4]/15 bg-white/80 px-4 py-3">
                  <span className="text-sm text-[#2A33A4]/70">{metric.label}</span>
                  <span className="text-xl font-semibold text-[#2A33A4]">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-glow reveal reveal-delay-2 border-[#2A33A4]/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2A33A4]/60">Workflow</p>
            <ol className="mt-5 space-y-5 text-sm">
              {timeline.map((item, index) => (
                <li key={item.stage} className="flex items-start gap-4">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#2A33A4]/30 text-xs font-semibold text-[#2A33A4]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#2A33A4]">{item.stage}</p>
                    <p className="text-[#2A33A4]/70">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
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
