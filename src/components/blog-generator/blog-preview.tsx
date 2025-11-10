"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import type { BlogGenerationResult, BlogSource } from "@/lib/blog-generator";
import { Badge } from "@/components/ui/badge";

interface BlogPreviewProps {
  blog: BlogGenerationResult;
}

const markerRegex = /<<([^|>]+)\|([^>]+)>>/g;

function renderParagraph(text: string, sourcesMap: Map<string, BlogSource>): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = markerRegex.exec(text)) !== null) {
    const [fullMatch, sourceId, anchor] = match;
    const matchIndex = match.index;
    const preceding = text.slice(lastIndex, matchIndex);
    if (preceding) {
      nodes.push(preceding);
    }

    const source = sourcesMap.get(sourceId.trim());
    if (source) {
      nodes.push(
        <a
          key={`${sourceId}-${matchIndex}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          {anchor.trim()}
        </a>,
      );
    } else {
      nodes.push(anchor.trim());
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  const trailing = text.slice(lastIndex);
  if (trailing) {
    nodes.push(trailing);
  }

  return nodes;
}

export function BlogPreview({ blog }: BlogPreviewProps) {
  const sourcesMap = new Map(blog.sources.map((source) => [source.id, source]));

  return (
    <article className="grid gap-12">
      <section className="space-y-6 rounded-3xl border border-border bg-card/80 p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {blog.title}
          </h2>
          {blog.meta?.keywords ? (
            <div className="flex flex-wrap gap-2">
              {blog.meta.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="bg-muted text-muted-foreground">
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <p className="text-base text-muted-foreground">{blog.intro}</p>

        <div className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-background/80 p-6">
          <h3 className="text-lg font-semibold text-foreground">TL;DR</h3>
          <p className="text-sm text-muted-foreground">{blog.tldr.summary}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {blog.tldr.bulletPoints.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-background/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Table of Contents</h3>
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {blog.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.anchor}`} className="transition-colors hover:text-primary">
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-10">
        {blog.sections.map((section) => (
          <div
            key={section.id}
            id={section.anchor}
            className="scroll-mt-32 rounded-3xl border border-border bg-card/90 p-10 shadow-sm"
          >
            <header className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">{section.heading}</h3>
              {section.focusKeywords?.length ? (
                <div className="flex flex-wrap gap-2">
                  {section.focusKeywords.map((keyword) => (
                    <Badge key={keyword} variant="neutral">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_minmax(0,_1fr)] md:gap-10">
              <div className="space-y-6 text-base leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{renderParagraph(paragraph, sourcesMap)}</p>
                ))}

                {section.callToAction ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-sm text-primary">
                    {section.callToAction}
                  </div>
                ) : null}

                {section.stats?.length ? (
                  <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/60 p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Key Stats
                    </h4>
                    <ul className="grid gap-3 text-sm text-muted-foreground">
                      {section.stats.map((stat) => {
                        const source = sourcesMap.get(stat.sourceId);
                        return (
                          <li key={`${stat.label}-${stat.value}`} className="space-y-1">
                            <div className="font-medium text-foreground">{stat.label}</div>
                            <div>{stat.value}</div>
                            {source ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline underline-offset-4"
                              >
                                {source.title}
                              </a>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>

              {section.image ? (
                <figure className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-inner">
                  <Image
                    src={section.image.url}
                    alt={section.image.alt}
                    width={Math.max(section.image.width, 800)}
                    height={Math.max(section.image.height, 600)}
                    className="h-full w-full object-cover"
                    style={{ backgroundColor: section.image.color ?? "#f8fafc" }}
                    loading="lazy"
                  />
                  <figcaption className="space-y-1 bg-card/90 p-4 text-xs text-muted-foreground">
                    Photo by
                    {" "}
                    <a
                      href={`${section.image.photographerProfile}?utm_source=claude_unsplash_generator&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      {section.image.photographerName}
                    </a>
                    {" "}on Unsplash
                  </figcaption>
                </figure>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/50 p-6 text-center text-sm text-muted-foreground">
                  Unsplash returned no imagery for this section. Refine keywords to fetch visuals.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card/90 p-10 shadow-sm">
        <h3 className="text-2xl font-semibold text-foreground">FAQ</h3>
        <div className="mt-6 space-y-6">
          {blog.faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-border/70 bg-background/80 p-5 transition"
              open={index === 0}
            >
              <summary className="cursor-pointer text-base font-semibold text-foreground">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card/80 p-10 shadow-sm">
        <h3 className="text-2xl font-semibold text-foreground">Conclusion</h3>
        <p className="mt-4 text-base text-muted-foreground">{blog.conclusion}</p>
      </section>

      <section className="rounded-3xl border border-border bg-card/80 p-10 shadow-sm">
        <h3 className="text-xl font-semibold text-foreground">Sources & Citations</h3>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          {blog.sources.map((source) => (
            <li key={source.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
              <div className="font-medium text-foreground">{source.title}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground/80">
                {source.author ?? "Source"} · {source.publishedDate ?? "Live"}
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-primary underline underline-offset-4"
              >
                {source.url}
              </a>
              {source.summary ? <p className="mt-2 text-xs text-muted-foreground">{source.summary}</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
