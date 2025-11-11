import { Suspense } from "react";
import { BlogGeneratorClient } from "@/components/blog-generator/blog-generator-client";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-14 lg:px-12">
      <header className="flex flex-col gap-6 rounded-3xl border border-border bg-card/70 p-10 shadow-sm backdrop-blur">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/60 px-4 py-1 text-xs font-semibold tracking-wide text-accent-foreground">
          SEO & GEO Visibility
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Generate production-ready geo-targeted SEO blogs in minutes.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Connect Claude for premium narrative quality, Unsplash for high-impact imagery, and Exa for authoritative
            backlinks. Ship YC-ready editorial assets with airtight sourcing, data-rich storytelling, and answers to
            the exact long-tail question your audience is searching.
          </p>
        </div>
        <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <li className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-4">
            Provide a primary keyword, an optional supporting keyword, and the specific question to answer—everything
            else is automated.
          </li>
          <li className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-4">
            Exa surfaces live statistics, references, and niche sources; every citation is linkable with trustable context.
          </li>
          <li className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-4">
            Unsplash imagery and attribution per section keep assets on-brand while maintaining a data-driven editorial tone.
          </li>
        </ul>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-4 rounded-3xl border border-border bg-card/50 p-10 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-24 animate-pulse rounded-3xl bg-muted" />
          </div>
        }
      >
        <BlogGeneratorClient />
      </Suspense>
    </main>
  );
}
