"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
} from "nuqs";
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
import { BlogPreview } from "@/components/blog-generator/blog-preview";

const tonePresets = [
  "authoritative",
  "conversational",
  "data-driven",
  "editorial",
  "persuasive",
];

const languagePresets = ["English", "Spanish", "French", "German", "Portuguese"];

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
  const [query, setQuery] = useQueryStates({
    primary: parseAsString.withDefault(""),
    secondary: parseAsString.withDefault(""),
    location: parseAsString.withDefault(""),
    audience: parseAsString.withDefault("Local buyers"),
    tone: parseAsString.withDefault(tonePresets[0]),
    language: parseAsString.withDefault(languagePresets[0]),
    country: parseAsString.withDefault("US"),
    wordCount: parseAsInteger.withDefault(1500),
    brief: parseAsString.withDefault(""),
  });

  const [blog, setBlog] = useState<BlogGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (key: keyof typeof query) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setQuery({ [key]: value });
      },
    [setQuery],
  );

  const handleToneChange = useCallback(
    (value: string) => {
      setQuery({ tone: value });
    },
    [setQuery],
  );

  const handleLanguageChange = useCallback(
    (value: string) => {
      setQuery({ language: value });
    },
    [setQuery],
  );

  const handleWordCountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseInt(event.target.value, 10);
      const sanitized = Number.isNaN(raw) ? 1500 : Math.min(Math.max(raw, 600), 6000);
      setQuery({ wordCount: sanitized });
    },
    [setQuery],
  );

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.toUpperCase().slice(0, 2);
      setQuery({ country: value });
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
            location: query.location.trim() || undefined,
            countryCode: query.country.trim() || undefined,
            audience: query.audience.trim() || undefined,
            tone: query.tone.trim() || undefined,
            wordCountGoal: query.wordCount ?? 1500,
            language: query.language.trim() || undefined,
            brief: query.brief.trim() || undefined,
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
    [query],
  );

  const toneBadges = useMemo(
    () =>
      tonePresets.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleToneChange(option)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            query.tone === option
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {option}
        </button>
      )),
    [handleToneChange, query.tone],
  );

  const languageBadges = useMemo(
    () =>
      languagePresets.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleLanguageChange(option)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            query.language === option
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {option}
        </button>
      )),
    [handleLanguageChange, query.language],
  );

  return (
    <section className="grid gap-12">
      <Card className="border-border/80 bg-card/90 shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Configure your campaign
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Define keywords, geography, and tone; the generator orchestrates live research, narrative structure, visuals, and outbound authority links automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primary">Primary keyword *</Label>
                <Input
                  id="primary"
                  placeholder="e.g. sustainable homes Austin"
                  value={query.primary}
                  onChange={handleInputChange("primary")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondary">Secondary keyword</Label>
                <Input
                  id="secondary"
                  placeholder="e.g. green building incentives"
                  value={query.secondary}
                  onChange={handleInputChange("secondary")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Geo focus</Label>
                <Input
                  id="location"
                  placeholder="City, metro, or region"
                  value={query.location}
                  onChange={handleInputChange("location")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country code</Label>
                <Input
                  id="country"
                  placeholder="US"
                  value={query.country}
                  maxLength={2}
                  onChange={handleCountryChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. first-time homebuyers"
                  value={query.audience}
                  onChange={handleInputChange("audience")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wordCount">Target word count</Label>
                <Input
                  id="wordCount"
                  type="number"
                  min={600}
                  max={6000}
                  step={100}
                  value={query.wordCount ?? 1500}
                  onChange={handleWordCountChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Preferred tone</Label>
              <div className="flex flex-wrap gap-2">{toneBadges}</div>
            </div>

            <div className="grid gap-2">
              <Label>Language</Label>
              <div className="flex flex-wrap gap-2">{languageBadges}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brief">Strategic brief / unique angles</Label>
              <Textarea
                id="brief"
                placeholder="Add nuance, differentiators, campaign goals, or mandatory talking points."
                value={query.brief}
                onChange={handleInputChange("brief")}
                rows={4}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="neutral" className="bg-muted text-muted-foreground">
                Claude · Unsplash · Exa orchestrated in one click
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
        <BlogPreview blog={blog} />
      ) : !blog && !isGenerating ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-sm text-muted-foreground">
          Your generated blog will appear here with live stats, anchored hyperlinks, Unsplash images, TL;DR, FAQ, and export-ready structure.
        </div>
      ) : null}
    </section>
  );
}
