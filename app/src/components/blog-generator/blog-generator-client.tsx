"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import type { BlogGenerationResult } from "@/lib/blog-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPreview, serializeBlogArticleHtml } from "@/components/blog-generator/blog-preview";
import { BlogEditor } from "@/components/blog-generator/blog-editor";
import { cn } from "@/lib/utils";

type QueryState = {
  primary: string;
  secondary: string;
  prompt: string;
};

const deliveryNotes = [
  {
    label: "Outputs",
    detail: "TL;DR, FAQ, CTA, citations, imagery",
  },
  {
    label: "Format",
    detail: "Rich HTML + inline editor handoff",
  },
  {
    label: "Review",
    detail: "Executive-ready in under five minutes",
  },
];

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function BlogGeneratorClient() {
  const [query, setQuery] = useQueryStates<QueryState>({
    primary: parseAsString.withDefault(""),
    secondary: parseAsString.withDefault(""),
    prompt: parseAsString.withDefault(""),
  });

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
    (key: keyof QueryState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setQuery({ [key]: value });
      },
    [setQuery],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsGenerating(true);
      setError(null);

      if (!query.primary.trim()) {
        setError("Primary keyword is required.");
        setIsGenerating(false);
        return;
      }

      if (!query.prompt.trim()) {
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
            primaryKeyword: query.primary.trim(),
            secondaryKeyword: query.secondary.trim() || undefined,
            answerPrompt: query.prompt.trim(),
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

  return (
    <section className="space-y-12">
      <Card className={cn("border-[#2A33A4]/20 bg-white/95 backdrop-blur transition-all duration-700 ease-out", animationClass)}>
        <CardHeader className="space-y-4">
          <Badge variant="secondary" className="w-fit tracking-[0.3em]">
            Campaign brief
          </Badge>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-[#2A33A4]">
              Configure your article inputs
            </CardTitle>
            <CardDescription className="text-sm text-[#2A33A4]/70">
              Supply the minimum data required for a geo-personalized draft. Tone, citations, and imagery are constrained to formal delivery standards.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <form className="grid gap-8" onSubmit={handleSubmit} aria-live="polite">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="primary" className="text-[#2A33A4]">
                  Primary keyword *
                </Label>
                <Input
                  id="primary"
                  placeholder="e.g. FX fees for SMB exporters"
                  value={query.primary}
                  onChange={handleInputChange("primary")}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="secondary" className="text-[#2A33A4]">
                  Secondary keyword
                </Label>
                <Input
                  id="secondary"
                  placeholder="e.g. cross-border payment compliance"
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline" className="tracking-[0.25em] text-[10px]">
                Data-led · English · Citations & imagery included
              </Badge>
              <Button type="submit" disabled={isGenerating} className="min-w-[180px]">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner /> Generating
                  </span>
                ) : (
                  "Generate blog"
                )}
              </Button>
            </div>
          </form>

          <div className="grid gap-4 border-t border-[#2A33A4]/15 pt-6 text-sm text-[#2A33A4]/75 md:grid-cols-3">
            {deliveryNotes.map((note) => (
              <div key={note.label} className="rounded-2xl border border-[#2A33A4]/15 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2A33A4]/60">{note.label}</p>
                <p className="mt-2 text-sm">{note.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-3xl border border-[#2A33A4] bg-white/95 px-6 py-4 text-sm text-[#2A33A4]"
        >
          {error}
        </div>
      ) : null}

      {isGenerating ? (
        <div className="grid gap-4 rounded-3xl border border-dashed border-[#2A33A4]/30 bg-white/80 p-10">
          <div className="h-6 w-48 animate-pulse rounded-full bg-[#2A33A4]/10" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[#2A33A4]/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-[#2A33A4]/10" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#2A33A4]/10" />
          </div>
        </div>
      ) : null}

      {blog && !isGenerating ? (
        <div className="space-y-10">
          <BlogEditor blog={blog} initialHtml={editedHtml ?? undefined} onSave={(html) => setEditedHtml(html)} />
          <BlogPreview blog={blog} customHtml={editedHtml ?? undefined} />
        </div>
      ) : !blog && !isGenerating ? (
        <div className="rounded-3xl border border-dashed border-[#2A33A4]/25 bg-white/60 p-10 text-sm text-[#2A33A4]/70">
          Your generated blog will appear here with the approved outline, TL;DR, FAQ, and source list.
        </div>
      ) : null}
    </section>
  );
}
