"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, Loader2, Sparkle } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BlogGenerationResult } from "@/lib/blog-generator";
import { serializeBlogArticleHtml } from "@/features/blog-generator";

type ListicleSuggestion = {
  title: string;
  subtitle: string;
  summary: string;
  platformFocus: string;
  keyTakeaways: string[];
  competitorHighlights: string[];
};

type ListicleComparativeResponse = {
  suggestions: ListicleSuggestion[];
  editorialDirection?: string;
};

const defaultPrompts: string[] = [
  "Compare the leading AI content optimization services for marketing teams in 2025",
  "Identify which vendors prioritize analytics visibility and workflow automation",
  "Highlight the pricing or packaging differences across enterprise and SMB tiers",
  "Explain which platforms integrate natively with popular marketing automation suites",
  "Surface the newest challenger brands gaining momentum with ecommerce marketers",
];

const availablePlatforms = [
  { id: "claude", label: "Claude" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
  { id: "copilot", label: "Microsoft Copilot" },
  { id: "custom-cms", label: "Custom CMS" },
] as const;

const ListicleCreatePage = () => {
  const [topic, setTopic] = useState("AI Content Optimization Services");
  const [promptInputs, setPromptInputs] = useState<string[]>(defaultPrompts);
  const [platformSelections, setPlatformSelections] = useState<string[]>(["claude", "chatgpt", "gemini"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListicleComparativeResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [article, setArticle] = useState<BlogGenerationResult | null>(null);
  const [articleHtml, setArticleHtml] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  const selectedSuggestion = useMemo(() => {
    if (selectedIndex === null || !result?.suggestions?.length) {
      return null;
    }
    return result.suggestions[selectedIndex];
  }, [result, selectedIndex]);

  const handlePromptChange = useCallback(
    (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
      setPromptInputs((previous) => {
        const next = [...previous];
        next[index] = event.target.value;
        return next;
      });
    },
    [],
  );

  const handlePlatformToggle = useCallback((platformId: string) => {
    setPlatformSelections((previous) => {
      if (previous.includes(platformId)) {
        return previous.filter((id) => id !== platformId);
      }
      return [...previous, platformId];
    });
  }, []);

  const handleResetPrompts = useCallback(() => {
    setPromptInputs(defaultPrompts);
  }, []);

  const handleGenerate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setArticle(null);
      setArticleHtml(null);
      setArticleError(null);
      setSelectedIndex(null);

      const trimmedTopic = topic.trim();
      const trimmedPrompts = promptInputs.map((prompt) => prompt.trim());

      if (!trimmedTopic) {
        setError("Topic is required.");
        return;
      }

      if (trimmedPrompts.some((prompt) => prompt.length === 0)) {
        setError("Please provide all five prompts.");
        return;
      }

      if (platformSelections.length === 0) {
        setError("Select at least one platform to optimize for.");
        return;
      }

      setIsGenerating(true);
      try {
        const response = await fetch("/api/generate/listicle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: trimmedTopic,
            prompts: trimmedPrompts,
            platforms: platformSelections,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "Failed to generate listicle concepts.");
        }

        const payload = (await response.json()) as ListicleComparativeResponse;
        if (!payload?.suggestions?.length) {
          throw new Error("No listicle concepts were returned. Try again with different prompts.");
        }

        setResult(payload);
        setSelectedIndex(null);
      } catch (generationError) {
        const message = generationError instanceof Error ? generationError.message : "Generation failed.";
        setError(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [platformSelections, promptInputs, topic],
  );

  const topBar = useMemo(
    () => (
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#1F2A6B]">Listicle Template</h1>
        <Button href="/blogpost" variant="ghost" className="rounded-full px-4 py-2 text-sm text-[#1F2A6B]/80 hover:text-[#1F2A6B]">
          Back to dashboard
        </Button>
      </div>
    ),
    [],
  );

  return (
    <BlogpostShell topBar={topBar}>
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8">
        <form
          onSubmit={handleGenerate}
          className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Comparative Content Configuration</p>
            <p className="text-xs text-slate-400">Capture the criteria Claude needs to build market-ready listicles.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2A6B]">
                  <Sparkle className="h-4 w-4" aria-hidden="true" />
                  Listicle concept generator
                </span>
                <span className="text-xs text-[#1F2A6B]/70">Outputs competitive roundup angles tailored to your prompts.</span>
              </div>
              <div className="hidden text-xs font-medium uppercase tracking-[0.3em] text-blue-500/70 sm:inline">Template</div>
            </div>

            <div className="space-y-3">
              <label htmlFor="topic" className="text-sm font-medium text-slate-700">
                Main topic<span className="text-[#EF4444]">*</span>
              </label>
              <Input
                id="topic"
                name="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. AI content optimization platforms"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Prompts to answer<span className="text-[#EF4444]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResetPrompts}
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Reset to defaults
                </button>
              </div>
              <div className="space-y-4">
                {promptInputs.map((prompt, index) => (
                  <div key={`prompt-${index}`} className="space-y-2">
                    <label htmlFor={`prompt-${index}`} className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Prompt {index + 1}
                    </label>
                    <Textarea
                      id={`prompt-${index}`}
                      name={`prompt-${index}`}
                      value={prompt}
                      onChange={handlePromptChange(index)}
                      rows={index === 0 ? 3 : 2}
                      required
                      placeholder="Describe the angle you want this section to tackle"
                    />
                  </div>
                ))}
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-slate-700">
                Platforms to optimize for<span className="text-[#EF4444]">*</span>
              </legend>
              <div className="grid gap-2">
                {availablePlatforms.map(({ id, label }) => {
                  const isSelected = platformSelections.includes(id);
                  return (
                    <label
                      key={id}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-2 text-sm transition",
                        isSelected ? "border-blue-500/50 bg-blue-500/10 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-200",
                      )}
                    >
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => handlePlatformToggle(id)}
                        aria-label={`Optimize for ${label}`}
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-2xl border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3 text-xs text-[#B91C1C]"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-auto pt-8">
            <Button type="submit" disabled={isGenerating} className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate listicle concepts">
              {isGenerating ? "Generating" : "Generate Concepts"}
            </Button>
          </div>
        </form>

        <div className="flex min-h-[460px] flex-col gap-4 rounded-3xl border border-[#2A33A4]/12 bg-white/90 p-6 shadow-[0_40px_110px_rgba(42,51,164,0.12)] backdrop-blur">
          {isGenerating ? (
            <div className="space-y-4" aria-live="polite">
              <div className="h-12 animate-pulse rounded-2xl bg-blue-500/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-blue-500/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-blue-500/10" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : result?.suggestions?.length ? (
            <div className="grid gap-5">
              <div className="space-y-3">
                {result.suggestions.map((suggestion, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => {
                        setSelectedIndex(index);
                        setArticleError(null);
                        setArticle(null);
                        setArticleHtml(null);
                        setArticleLoading(true);
                        const trimmedPrompts = promptInputs.map((prompt) => prompt.trim());
                        void fetch("/api/generate/listicle/article", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            topic: topic.trim(),
                            prompts: trimmedPrompts,
                            platforms: platformSelections,
                            suggestion,
                            editorialDirection: result.editorialDirection,
                          }),
                        })
                          .then(async (response) => {
                            if (!response.ok) {
                              const payload = await response.json().catch(() => null);
                              throw new Error(payload?.message ?? "Failed to generate article.");
                            }
                            const payload = (await response.json()) as BlogGenerationResult;
                            setArticle(payload);
                            setArticleHtml(serializeBlogArticleHtml(payload));
                          })
                          .catch((generationError) => {
                            const message = generationError instanceof Error ? generationError.message : "Failed to build article.";
                            setArticleError(message);
                          })
                          .finally(() => {
                            setArticleLoading(false);
                          });
                      }}
                      className={cn(
                        "flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition",
                        isActive
                          ? "border-blue-500 bg-blue-500/5 text-[#1F2A6B] shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
                          : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-500/5",
                      )}
                    >
                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">{suggestion.subtitle}</span>
                      <span className="text-sm font-semibold text-slate-900">{suggestion.title}</span>
                      <span className="text-xs text-slate-500">Platform focus: {suggestion.platformFocus}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSuggestion ? (
                <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/95 p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#1F2A6B]">{selectedSuggestion.title}</p>
                    <p className="text-xs text-slate-500">{selectedSuggestion.summary}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Key takeaways</p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedSuggestion.keyTakeaways.map((takeaway, index) => (
                        <li key={`takeaway-${index}`} className="rounded-2xl border border-slate-200/60 bg-white/90 px-3 py-2">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Competitor highlights</p>
                    <ul className="space-y-1.5 text-xs text-blue-700">
                      {selectedSuggestion.competitorHighlights.map((highlight, index) => (
                        <li key={`highlight-${index}`} className="rounded-2xl border border-blue-500/30 bg-blue-500/5 px-3 py-2">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {articleLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-blue-200 bg-blue-50/60 p-6 text-sm text-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Generating full comparative article...
                </div>
              ) : null}

              {articleError ? (
                <div className="rounded-3xl border border-[#EF4444]/30 bg-[#FEF2F2] p-4 text-xs text-[#B91C1C]" role="alert">
                  {articleError}
                </div>
              ) : null}

              {article && articleHtml ? (
                <div className="max-h-[60vh] overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/95 p-6">
                  <article className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: articleHtml }} />
                </div>
              ) : null}

              {result.editorialDirection ? (
                <div className="rounded-3xl border border-violet-200 bg-violet-50/80 p-4 text-xs text-violet-700">
                  <p className="font-semibold uppercase tracking-[0.2em]">Editorial direction</p>
                  <p className="mt-1 leading-relaxed text-violet-600">{result.editorialDirection}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-[#2A33A4]/70" aria-live="polite">
              <p>Generate a comparative listicle to see market-ready concepts.</p>
              <p className="text-xs text-[#2A33A4]/60">We’ll analyze competitor coverage and suggest differentiated angles.</p>
            </div>
          )}
        </div>
      </div>
    </BlogpostShell>
  );
};

export default ListicleCreatePage;
