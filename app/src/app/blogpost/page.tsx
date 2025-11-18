"use client";

import { Suspense, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, List, Sparkles, BookText, Box } from "lucide-react";
import { BlogGenerator } from "@/features/blog-generator";
import { Button } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";
import { BlogpostShell } from "./_components/blogpost-shell";

type TabId = "create" | "templates";

type TemplateCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  accent?: string;
};

const blogNavItems: Array<{ id: TabId; label: string }> = [
  { id: "create", label: "Create" },
  { id: "templates", label: "Templates" },
];

const templateCards: TemplateCard[] = [
  {
    id: "suggested",
    title: "Suggested",
    description: "Use Bear's data insights to auto-suggest",
    icon: Lightbulb,
    href: "/blogpost/create/suggested",
  },
  {
    id: "listicle",
    title: "Listicle",
    description: "Create a listicle blog post",
    icon: List,
    href: "/blogpost/create/listicle",
  },
  {
    id: "how-to",
    title: "How-To Guide",
    description: "Step-by-step instructions to accomplish a specific task",
    icon: Sparkles,
    href: "/blogpost/create/how-to-guide",
  },
  {
    id: "comparison",
    title: "Comparison",
    description: "Compare your solution with competitors",
    icon: BookText,
    href: "/blogpost/create/comparison",
  },
  {
    id: "what-is-product",
    title: "What is it?",
    description: "Explain your product clearly for first-time audiences",
    icon: Box,
    href: "/blogpost/create/what-is-product",
  },
];

const templateButtonBaseClass = "border border-blue-500/30 bg-white text-blue-700 hover:border-blue-500/50 hover:bg-blue-500/10";

const SuspenseFallback = () => (
  <div className="grid gap-4 rounded-3xl border border-[#2A33A4]/15 bg-white/85 p-10 shadow-[0_25px_65px_rgba(42,51,164,0.08)]">
    <div className="h-6 w-32 animate-pulse rounded-full bg-[#2A33A4]/10" />
    <div className="h-24 animate-pulse rounded-3xl bg-[#2A33A4]/10" />
  </div>
);

const BlogpostPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("create");

  const handleTabSelect = (id: TabId) => () => {
    setActiveTab(id);
  };

  const renderedContent = useMemo(() => {
    if (activeTab === "templates") {
      return (
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">Templates</h2>
            <p className="text-sm text-slate-500">Generate high quality GEO content in minutes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {templateCards.map(({ id, title, description, icon: Icon, accent, href }) => (
              <article
                key={id}
                className="flex flex-col gap-5 rounded-3xl border border-slate-200/60 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-600" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Template</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
                <Button
                  href={href ?? "/blogpost/create"}
                  className={cn(
                    "mt-auto rounded-full px-5 py-2 text-sm",
                    templateButtonBaseClass,
                    accent,
                  )}
                  aria-label={`Create ${title} blog template`}
                >
                  Create
                </Button>
              </article>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={<SuspenseFallback />}>
        <BlogGenerator />
      </Suspense>
    );
  }, [activeTab]);

  const topBar = (
    <div className="flex flex-wrap items-center justify-start gap-2">
      {blogNavItems.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <Button
            key={id}
            onClick={handleTabSelect(id)}
            aria-pressed={isActive}
            variant="ghost"
            className={cn(
              "rounded-full px-4 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F2A6B]/30",
              templateButtonBaseClass,
              isActive && "border-[#1F2A6B] bg-[#1F2A6B] text-white hover:bg-[#1F2A6B] hover:text-white",
            )}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );

  return <BlogpostShell topBar={topBar}>{renderedContent}</BlogpostShell>;
};

export default BlogpostPage;

