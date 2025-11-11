"use client";

import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import type { BlogGenerationResult } from "@/lib/blog-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPreview, serializeBlogArticleHtml } from "@/components/blog-generator/blog-preview";
import { BlogEditor } from "@/components/blog-generator/blog-editor";

type QueryState = {
  primary: string;
  secondary: string;
  prompt: string;
};

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
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

  return (
    <section className="grid gap-12">
      <Card className="border-border/80 bg-card/90 shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Configure your campaign
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Define the primary keyword, optionally refine with a secondary keyword, and give the long-tail
            question to answer. The generator handles research, citations, tone, and imagery automatically with a
            data-driven editorial voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primary">Primary keyword *</Label>
                <Input
                  id="primary"
                  placeholder="e.g. FX fees for SMB exporters"
                  value={query.primary}
                  onChange={handleInputChange("primary")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondary">Secondary keyword</Label>
                <Input
                  id="secondary"
                  placeholder="e.g. cross-border payment compliance"
                  value={query.secondary}
                  onChange={handleInputChange("secondary")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt to answer *</Label>
              <Textarea
                id="prompt"
                placeholder="e.g. How do FX fees impact cross-border SaaS transactions for EU startups?"
                value={query.prompt}
                onChange={handleInputChange("prompt")}
                rows={4}
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="neutral" className="bg-muted text-muted-foreground">
                Data-driven tone · English output · Images & citations auto-sourced
              </Badge>
              <Button type="submit" disabled={isGenerating} className="min-w-[160px]">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Generating…
                  </span>
                ) : (
                  "Generate blog"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isGenerating ? (
        <div className="grid gap-4 rounded-3xl border border-border bg-card/70 p-10 shadow-sm">
          <div className="h-8 w-56 animate-pulse rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : null}

      {blog && !isGenerating ? (
        <div className="space-y-10">
          <BlogEditor
            blog={blog}
            initialHtml={editedHtml ?? undefined}
            onSave={(html) => setEditedHtml(html)}
          />
          <BlogPreview blog={blog} customHtml={editedHtml ?? undefined} />
        </div>
      ) : !blog && !isGenerating ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-sm text-muted-foreground">
          Your generated blog will appear here with live stats, anchored hyperlinks, Unsplash images, TL;DR, FAQ, and export-ready structure tailored to the prompt above.
        </div>
      ) : null}
    </section>
  );
}
