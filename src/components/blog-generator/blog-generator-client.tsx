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
import { BlogPreview } from "@/components/blog-generator/blog-preview";

const LoadingSpinner = () => (
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

export const BlogGeneratorClient = () => {
  const [query, setQuery] = useQueryStates({
    primary: parseAsString.withDefault(""),
    secondary: parseAsString.withDefault(""),
    topics: parseAsString.withDefault(""),
  });

  const [blog, setBlog] = useState<BlogGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (key: keyof typeof query) =>
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

      if (!query.primary.trim()) {
        setError("Primary keyword is required.");
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
            brief: query.topics.trim() || undefined,
            language: "English",
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as BlogGenerationResult;
        setBlog(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate blog.";
        setError(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [query.primary, query.secondary, query.topics],
  );

  const renderPreviewContent = () => {
    if (error) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div
          aria-live="polite"
          className="grid gap-4 rounded-3xl border border-border bg-card/70 p-10 shadow-sm"
        >
          <div className="h-8 w-56 animate-pulse rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      );
    }

    if (blog) {
      return <BlogPreview blog={blog} />;
    }

    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-sm text-muted-foreground">
        Your generated blog will appear here with live stats, anchored hyperlinks, Unsplash images,
        TL;DR, FAQ, and export-ready structure.
      </div>
    );
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="border-border/80 bg-card/90 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground">Blog setup</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Add the keywords and talking points—we will orchestrate research, structure, and visuals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="primary">Primary keyword *</Label>
              <Input
                id="primary"
                placeholder="e.g. modular AI infrastructure"
                value={query.primary}
                onChange={handleInputChange("primary")}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondary">Secondary keyword</Label>
              <Input
                id="secondary"
                placeholder="e.g. scalable atomic agents"
                value={query.secondary}
                onChange={handleInputChange("secondary")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topics">Topics to answer</Label>
              <Textarea
                id="topics"
                placeholder="List the must-answer questions, pain points, or proof points."
                aria-describedby="topics-hint"
                value={query.topics}
                onChange={handleInputChange("topics")}
                rows={5}
              />
              <p id="topics-hint" className="text-xs text-muted-foreground">
                Separate themes with commas or line breaks for best context.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full justify-center"
              aria-live="polite"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Creating…
                </span>
              ) : (
                "Create blog post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4" aria-busy={isGenerating}>
        {renderPreviewContent()}
      </div>
    </section>
  );
};
