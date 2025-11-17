"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";

interface TemplateConfigData {
  title: string;
  description: string;
  topics: string[];
  prompts: string[];
  platforms: string[];
  citationsPlaceholder: string;
  brandKitPlaceholder: string;
}

interface TemplateConfigProps {
  templateId: string;
  onBack?: () => void;
}

const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: LucideIcon }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" /> : null}
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    {children}
  </div>
);

export const TemplateConfig = ({ templateId, onBack }: TemplateConfigProps) => {
  const [state, setState] = useState<TemplateConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/templates?id=${templateId}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to load template settings");
        }
        const data = (await response.json()) as TemplateConfigData;
        setState(data);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [templateId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-200 bg-white/90 text-slate-500">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500" aria-hidden="true" />
        <p className="text-sm">Loading template...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-[28px] border border-red-200 bg-red-50 text-center text-red-600">
        <p className="text-sm font-medium">{error ?? "Template not found"}</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[520px] gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white/95 p-5">
        {onBack ? (
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-fit items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to manual generate
          </Button>
        ) : null}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Content Configuration</p>
          <h2 className="text-base font-semibold text-slate-900">{state.title}</h2>
          <p className="text-sm text-slate-500">{state.description}</p>
        </div>

        <Section title="Topics">
          <div className="space-y-2">
            {state.topics.map((topic) => (
              <div key={topic} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {topic}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Prompts">
          <div className="space-y-2">
            {state.prompts.map((prompt) => (
              <div key={prompt} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                {prompt}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Platforms">
          <div className="flex flex-wrap gap-2">
            {state.platforms.map((platform) => (
              <span key={platform} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {platform}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Citations">
          <Button variant="ghost" className="w-full justify-start rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">
            {state.citationsPlaceholder}
          </Button>
        </Section>

        <Section title="Brand Kit (optional)">
          <Button variant="ghost" className="w-full justify-start rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">
            {state.brandKitPlaceholder}
          </Button>
        </Section>

        <Button className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-sm">Generate Titles</Button>
      </aside>

      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-center text-sm text-slate-500">
        Configure your blog
        <br />
        Generated titles will appear here
      </div>
    </div>
  );
};
