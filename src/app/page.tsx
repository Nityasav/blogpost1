import Image from "next/image";
import { Suspense } from "react";
import { BlogGeneratorClient } from "@/components/blog-generator/blog-generator-client";

const placeholderCards = [
  {
    id: "briefs",
    label: "Active briefs",
    value: "12 live",
    gradient: "from-sky-500/80 via-indigo-500/80 to-purple-500/80",
  },
  {
    id: "research",
    label: "Research sync",
    value: "4 new cites",
    gradient: "from-emerald-500/80 via-lime-500/80 to-emerald-600/80",
  },
  {
    id: "timeline",
    label: "Publishing queue",
    value: "Next deploy · 1h",
    gradient: "from-amber-500/80 via-orange-500/80 to-rose-500/80",
  },
];

const FillerDashboardColumn = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-12 flex flex-col gap-4">
      {placeholderCards.map((card) => (
        <div
          key={card.id}
          aria-label={`${card.label} placeholder`}
          className={`rounded-3xl bg-gradient-to-br ${card.gradient} p-4 text-left text-white shadow-lg shadow-black/20`}
          tabIndex={0}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">{card.label}</p>
          <p className="pt-2 text-lg font-semibold">{card.value}</p>
          <div className="mt-4 h-16 rounded-2xl bg-white/20" />
        </div>
      ))}
    </div>
  </aside>
);

const SuspenseFallback = () => (
  <div className="grid gap-4 rounded-3xl border border-border bg-card/60 p-10 shadow-sm">
    <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
    <div className="h-24 animate-pulse rounded-3xl bg-muted" />
  </div>
);

const Home = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-10">
        <header className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Antifragility logo"
              width={48}
              height={48}
              priority
              className="rounded-2xl border border-border/40 bg-card p-2"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Antifragility</p>
              <p className="text-base font-semibold text-foreground">Modular Blog OS</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
          <FillerDashboardColumn />
          <Suspense fallback={<SuspenseFallback />}>
            <BlogGeneratorClient />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default Home;
