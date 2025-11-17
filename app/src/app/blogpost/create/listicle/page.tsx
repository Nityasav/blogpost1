"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Check } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";

type TopicOption = {
  value: string;
  label: string;
};

type PromptOption = {
  id: string;
  label: string;
};

const topicOptions: TopicOption[] = [
  { value: "ai-content-optimization-services", label: "AI Content Optimization Services" },
  { value: "ai-content-optimization-tools", label: "AI Content Optimization Tools" },
  { value: "ai-workflows", label: "AI Workflows" },
];

const promptOptions: PromptOption[] = [
  { id: "prompt-1", label: "1. best AI content optimization services for marketing teams" },
  { id: "prompt-2", label: "2. best AI content optimization tools for marketing agencies" },
  { id: "prompt-3", label: "3. best AI content optimization services for marketers" },
  { id: "prompt-4", label: "4. AI content optimization services for ecommerce product descriptions" },
  { id: "prompt-5", label: "5. AI content optimization services for ecommerce product descriptions" },
];

const ListicleCreatePage = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>(topicOptions[0]?.value ?? "");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>(() => promptOptions.map(({ id }) => id));

  const selectedCountLabel = useMemo(() => {
    if (selectedPrompts.length === 0) {
      return "No prompts selected";
    }

    if (selectedPrompts.length === 1) {
      return "1 prompt selected";
    }

    return `${selectedPrompts.length} prompts selected`;
  }, [selectedPrompts.length]);

  const handleTopicChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(event.target.value);
  }, []);

  const handlePromptToggle = useCallback(
    (promptId: string) => () => {
      setSelectedPrompts((previous) => {
        if (previous.includes(promptId)) {
          return previous.filter((id) => id !== promptId);
        }

        return [...previous, promptId];
      });
    },
  []);

  const handleSelectAllPrompts = useCallback(() => {
    setSelectedPrompts(promptOptions.map(({ id }) => id));
  }, []);

  const handleClearPrompts = useCallback(() => {
    setSelectedPrompts([]);
  }, []);

  const handleGenerateTitles = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

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
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
        <form
          onSubmit={handleGenerateTitles}
          className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Content Configuration</p>
            <p className="text-xs text-slate-400">Select focus areas and prompts to generate a structured listicle outline.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-sm font-semibold text-[#1F2A6B]">Listicle</span>
                <span className="text-xs text-[#1F2A6B]/70">Create a listicle blog post</span>
              </div>
              <div className="hidden text-xs font-medium uppercase tracking-[0.3em] text-blue-500/70 sm:inline">Template</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium text-slate-700">
                Topics
              </label>
              <div className="relative">
                <select
                  id="topic"
                  name="topic"
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {topicOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-slate-700">Prompts</legend>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{selectedCountLabel}</p>
                  <div className="flex items-center gap-3 text-xs font-medium text-blue-600">
                    <button type="button" onClick={handleSelectAllPrompts} className="transition hover:text-blue-700">
                      Select All
                    </button>
                    <button type="button" onClick={handleClearPrompts} className="transition hover:text-blue-700">
                      Clear
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor="prompt-search" className="sr-only">
                    Search prompts
                  </label>
                  <input
                    id="prompt-search"
                    name="prompt-search"
                    placeholder="Search prompts..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {promptOptions.map(({ id, label }) => {
                    const isSelected = selectedPrompts.includes(id);
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={handlePromptToggle(id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm transition hover:bg-blue-500/5",
                            isSelected ? "bg-blue-500/10 text-blue-700" : "text-slate-600",
                          )}
                          aria-pressed={isSelected}
                        >
                          <span>{label}</span>
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-transparent",
                              isSelected ? "border-blue-600 bg-blue-600 text-white" : "",
                            )}
                            aria-hidden="true"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </fieldset>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate listicle titles">
              Generate Titles
            </Button>
          </div>
        </form>

        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
          <p className="text-sm font-medium text-slate-500">Configure your listicle</p>
          <p className="mt-1 text-xs text-slate-400">Generated titles will appear here</p>
        </div>
      </div>
    </BlogpostShell>
  );
};

export default ListicleCreatePage;
