"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useQueryStates, parseAsString } from "nuqs";
import type { BlogGenerationResult } from "@/lib/blog-generator";
import { Button } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serializeBlogArticleHtml } from "./blog-preview";
import { BlogEditor } from "./blog-editor";
import { cn } from "@/lib/utils";

const queryParsers = {
  primary: parseAsString.withDefault(""),
  secondary: parseAsString.withDefault(""),
  prompt: parseAsString.withDefault(""),
} as const;

const LoadingSpinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export const BlogGenerator = () => {
  const [query, setQuery] = useQueryStates(queryParsers);
  const [blog, setBlog] = useState<BlogGenerationResult | null>(null);
  const [editedHtml, setEditedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReducedMotion) {
      setMounted(true);
      return;
    }
    const timeout = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleInputChange = useCallback(
    (key: keyof typeof queryParsers) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setQuery({ [key]: event.target.value });
      },
    [setQuery],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsGenerating(true);
      setError(null);

      const trimmedPrimary = query.primary.trim();
      const trimmedPrompt = query.prompt.trim();

      if (!trimmedPrimary) {
        setError("Primary keyword is required.");
        setIsGenerating(false);
        return;
      }

      if (!trimmedPrompt) {
        setError("Prompt to answer is required.");
        setIsGenerating(false);
        return;
      }

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            primaryKeyword: trimmedPrimary,
            secondaryKeyword: query.secondary.trim() || undefined,
            answerPrompt: trimmedPrompt,
            tone: "data-driven and statistics-backed",
            language: "English",
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as BlogGenerationResult;
        setBlog(payload);
        setEditedHtml(serializeBlogArticleHtml(payload));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate blog.";
        setError(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [query],
  );

  const animationClass = mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  const previewContent = useMemo(() => {
    let body: ReactNode;

    if (error) {
      body = (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-3xl border border-[#EF4444]/30 bg-[#FEF2F2] px-6 py-4 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      );
    } else if (isGenerating) {
      body = (
        <div aria-live="polite" className="grid min-h-[320px] gap-4 rounded-[22px] border border-dashed border-[#2A33A4]/20 bg-white/80 p-10">
          <div className="h-6 w-48 animate-pulse rounded-full bg-[#2A33A4]/10" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[#2A33A4]/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-[#2A33A4]/10" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#2A33A4]/10" />
          </div>
        </div>
      );
    } else if (blog) {
      body = (
        <div className="flex flex-col gap-8 pb-12">
          <BlogEditor blog={blog} initialHtml={editedHtml ?? undefined} onSave={(html) => setEditedHtml(html)} />
        </div>
      );
    } else {
      body = (
        <div className="flex min-h-[360px] items-center justify-center rounded-[22px] bg-white/75 px-6 text-sm text-[#2A33A4]/70" aria-hidden="true">
          Your generated blog will appear here with the approved outline, TL;DR, FAQ, and source list.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scroll-smooth px-6 py-6 md:max-h-[66vh] xl:max-h-[74vh]">
          {body}
        </div>
      </div>
    );
  }, [blog, editedHtml, error, isGenerating]);

  return (
    <section className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,490px)_minmax(0,1fr)] xl:items-start">
      <Card className={cn("reveal rounded-[30px] border text-[#2A33A4] shadow-[0_40px_105px_rgba(42,51,164,0.1)] border-[#2A33A4]/25 bg-white/95 backdrop-blur transition-all duration-700 ease-out", animationClass)}>
        <CardHeader className="space-y-3">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold text-[#2A33A4]">Configure your article inputs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-10">
          <form className="grid gap-8" onSubmit={handleSubmit} aria-live="polite">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="grid gap-2.5">
                <Label htmlFor="primary" className="text-[#2A33A4]">
                  Primary keyword *
                </Label>
                <Input
                  id="primary"
                  placeholder="e.g. FX fees"
                  value={query.primary}
                  onChange={handleInputChange("primary")}
                  required
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="secondary" className="text-[#2A33A4]">
                  Secondary keyword
                </Label>
                <Input
                  id="secondary"
                  placeholder="e.g. cross-border laws"
                  value={query.secondary}
                  onChange={handleInputChange("secondary")}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="prompt" className="text-[#2A33A4]">
                Prompt to answer *
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g. How do FX fees impact cross-border SaaS transactions for EU startups?"
                value={query.prompt}
                onChange={handleInputChange("prompt")}
                rows={4}
                required
              />
              <p className="text-xs text-[#2A33A4]/60">Use a single, declarative sentence to keep the outline formal.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button type="submit" disabled={isGenerating} className="min-w-[200px] px-9 py-4 text-base">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner /> Generating
                  </span>
                ) : (
                  <span className="font-semibold">Generate blog</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="reveal flex h-full min-h-0 flex-col gap-4 rounded-[36px] border border-[#2A33A4]/12 bg-white/78 p-6 shadow-[0_55px_130px_rgba(42,51,164,0.12)] backdrop-blur-lg">
        {previewContent}
      </div>
    </section>
  );
};
