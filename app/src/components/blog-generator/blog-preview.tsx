"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import type { BlogGenerationResult, BlogSource } from "@/lib/blog-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/neon-button";

interface BlogPreviewProps {
  blog: BlogGenerationResult;
  customHtml?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRichTextNodes(text: string, sourcesMap: Map<string, BlogSource>) {
  const regex = /<<([^|>]+)\|([^>]+)>>/g;
  const nodes: Array<string | ReactNode> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, sourceId, anchor] = match;
    const matchIndex = match.index;
    const preceding = text.slice(lastIndex, matchIndex);
    if (preceding) {
      nodes.push(preceding);
    }

    const source = sourcesMap.get(sourceId.trim());
    const anchorText = anchor.trim();
    if (source) {
      nodes.push(
        <a
          key={`${sourceId}-${matchIndex}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          {anchorText}
        </a>,
      );
    } else {
      nodes.push(anchorText);
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  const trailing = text.slice(lastIndex);
  if (trailing) {
    nodes.push(trailing);
  }

  return nodes.length ? nodes : [text];
}

function renderRichTextHtml(text: string, sourcesMap: Map<string, BlogSource>): string {
  const regex = /<<([^|>]+)\|([^>]+)>>/g;
  let html = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, sourceId, anchor] = match;
    const matchIndex = match.index;
    const preceding = text.slice(lastIndex, matchIndex);
    if (preceding) {
      html += escapeHtml(preceding);
    }

    const source = sourcesMap.get(sourceId.trim());
    const anchorText = escapeHtml(anchor.trim());
    if (source) {
      html += `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${anchorText}</a>`;
    } else {
      html += anchorText;
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  const trailing = text.slice(lastIndex);
  if (trailing) {
    html += escapeHtml(trailing);
  }

  return html;
}

export function serializeBlogArticleHtml(blog: BlogGenerationResult, sourcesMap?: Map<string, BlogSource>): string {
  const map = sourcesMap ?? new Map(blog.sources.map((source) => [source.id, source] as const));

  const sectionsHtml = blog.sections
    .map((section) => {
      const imageHtml = section.image
        ? `<figure>
            <img src="${escapeHtml(section.image.url)}" alt="${escapeHtml(section.image.alt)}" style="width:100%;height:auto;border-radius:16px;" loading="lazy" />
            <figcaption style="font-size:0.9rem;color:#55606f;margin-top:8px;">
              Photo by <a href="${escapeHtml(section.image.photographerProfile)}?utm_source=claude_unsplash_generator&utm_medium=referral" target="_blank" rel="noopener noreferrer">${escapeHtml(section.image.photographerName)}</a> on Unsplash
            </figcaption>
          </figure>`
        : "";

      const paragraphsHtml = section.paragraphs
        .map((paragraph) => `<p>${renderRichTextHtml(paragraph, map)}</p>`)
        .join("\n");

      const callToActionHtml = section.callToAction
        ? `<p><strong>${renderRichTextHtml(section.callToAction, map)}</strong></p>`
        : "";

      return `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          ${imageHtml}
          ${paragraphsHtml}
          ${callToActionHtml}
        </section>
      `;
    })
    .join("\n");

  const faqsHtml = blog.faqs
    .map(
      (faq) => `
        <section>
          <h3>${escapeHtml(faq.question)}</h3>
          <p>${renderRichTextHtml(faq.answer, map)}</p>
        </section>
      `,
    )
    .join("\n");

  const sourcesHtml = blog.sources
    .map(
      (source) => `
        <li>
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a>
        </li>
      `,
    )
    .join("\n");

  return `
  <article>
    <h1>${escapeHtml(blog.title)}</h1>
    ${blog.meta?.keywords?.length ? `<p><strong>Keywords:</strong> ${escapeHtml(blog.meta.keywords.join(", "))}</p>` : ""}
    <p>${renderRichTextHtml(blog.intro, map)}</p>
    <section>
      <h2>TL;DR</h2>
      <p>${renderRichTextHtml(blog.tldr.summary, map)}</p>
      <ul>
        ${blog.tldr.bulletPoints.map((item) => `<li>${renderRichTextHtml(item, map)}</li>`).join("\n")}
      </ul>
    </section>
    <section>
      <h2>Table of Contents</h2>
      <ol>
        ${blog.sections.map((section) => `<li>${escapeHtml(section.heading)}</li>`).join("\n")}
      </ol>
    </section>
    ${sectionsHtml}
    <section>
      <h2>Conclusion</h2>
      <p>${renderRichTextHtml(blog.conclusion, map)}</p>
    </section>
    <section>
      <h2>FAQ</h2>
      ${faqsHtml}
    </section>
    <section>
      <h2>Sources</h2>
      <ol>
        ${sourcesHtml}
      </ol>
    </section>
  </article>`;
}

export function serializeBlogToHtml(blog: BlogGenerationResult, sourcesMap?: Map<string, BlogSource>): string {
  const article = serializeBlogArticleHtml(blog, sourcesMap);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(blog.title)}</title>
</head>
<body>
${article}
</body>
</html>`;
}

export function BlogPreview({ blog, customHtml }: BlogPreviewProps) {
  const sourcesMap = useMemo(() => new Map(blog.sources.map((source) => [source.id, source])), [blog.sources]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const htmlForCopy = useMemo(() => {
    if (customHtml) {
      return customHtml.startsWith("<!DOCTYPE") ? customHtml : `<!DOCTYPE html><html><body>${customHtml}</body></html>`;
    }
    return serializeBlogToHtml(blog, sourcesMap);
  }, [blog, customHtml, sourcesMap]);

  const handleCopy = useCallback(async () => {
    if (!contentRef.current) return;

    const plain = contentRef.current.innerText;
    try {
      if (window.navigator.clipboard && "write" in window.navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await window.navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([htmlForCopy], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
      } else {
        await window.navigator.clipboard.writeText(plain);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Clipboard copy failed", error);
      setCopied(false);
    }
    }, [htmlForCopy]);

  if (customHtml) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex justify-end">
          <Button onClick={handleCopy} variant="secondary" className="px-6">
            {copied ? "Copied" : "Copy Blog"}
          </Button>
        </div>
        <article
          ref={contentRef}
          className="blog-content rounded-3xl border border-[#2A33A4]/20 bg-white/95 p-8 text-base text-[#2A33A4] shadow-[0_30px_80px_rgba(42,51,164,0.08)]"
          dangerouslySetInnerHTML={{ __html: customHtml }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={handleCopy} variant="secondary" className="px-6">
          {copied ? "Copied" : "Copy Blog"}
        </Button>
      </div>
        <article
          ref={contentRef}
          className="mx-auto flex w-full flex-col gap-8 rounded-3xl border border-[#2A33A4]/20 bg-white/95 p-8 text-base leading-8 text-[#2A33A4] shadow-[0_30px_80px_rgba(42,51,164,0.08)]"
        >
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {blog.meta?.keywords?.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="tracking-[0.25em] text-[10px]">
                  {keyword}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#2A33A4] md:text-4xl">{blog.title}</h1>
            <p className="text-[#2A33A4]/70">{renderRichTextNodes(blog.intro, sourcesMap)}</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#2A33A4]">TL;DR</h2>
            <p>{renderRichTextNodes(blog.tldr.summary, sourcesMap)}</p>
            <ul className="list-disc space-y-2 pl-6">
              {blog.tldr.bulletPoints.map((item, index) => (
                <li key={index}>{renderRichTextNodes(item, sourcesMap)}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#2A33A4]">Table of Contents</h2>
            <ol className="list-decimal space-y-2 pl-6 text-[#2A33A4]/80">
              {blog.sections.map((section) => (
                <li key={section.id}>{section.heading}</li>
              ))}
            </ol>
          </section>

          {blog.sections.map((section) => (
            <section key={section.id} className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#2A33A4]">{section.heading}</h2>
              {section.image ? (
                <figure className="w-full">
                  <Image
                    src={section.image.url}
                    alt={section.image.alt}
                    width={section.image.width}
                    height={section.image.height}
                    className="w-full rounded-2xl border border-[#2A33A4]/10 object-cover"
                    style={{ backgroundColor: section.image.color ?? "#ffffff" }}
                    loading="lazy"
                  />
                  <figcaption className="mt-2 text-sm text-[#2A33A4]/60">
                    Photo by{" "}
                    <a
                      href={`${section.image.photographerProfile}?utm_source=claude_unsplash_generator&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-4"
                    >
                      {section.image.photographerName}
                    </a>{" "}
                    on Unsplash
                  </figcaption>
                </figure>
              ) : null}

              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{renderRichTextNodes(paragraph, sourcesMap)}</p>
              ))}

              {section.callToAction ? (
                <p className="font-semibold text-[#2A33A4]">{renderRichTextNodes(section.callToAction, sourcesMap)}</p>
              ) : null}
            </section>
          ))}

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#2A33A4]">Conclusion</h2>
            <p>{renderRichTextNodes(blog.conclusion, sourcesMap)}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#2A33A4]">FAQ</h2>
            {blog.faqs.map((faq, index) => (
              <div key={index} className="space-y-1">
                <h3 className="text-lg font-semibold text-[#2A33A4]">{faq.question}</h3>
                <p className="text-[#2A33A4]/70">{renderRichTextNodes(faq.answer, sourcesMap)}</p>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#2A33A4]">Sources</h2>
            <ol className="list-decimal space-y-2 pl-6 text-[#2A33A4]/70">
              {blog.sources.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </div>
    );
  }
