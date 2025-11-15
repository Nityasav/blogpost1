import { sendClaudeMessage } from "@/lib/clients/claude";
import { searchExa } from "@/lib/clients/exa";
import { findUnsplashImage, type UnsplashImage } from "@/lib/clients/unsplash";
import { toAnchorSlug } from "@/lib/slug";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

export interface BlogGenerationInput {
  primaryKeyword: string;
  secondaryKeyword?: string;
  answerPrompt: string;
  location?: string;
  countryCode?: string;
  audience?: string;
  tone?: string;
  wordCountGoal?: number;
  language?: string;
  brief?: string;
}

export interface BlogSource {
  id: string;
  title: string;
  url: string;
  summary?: string;
  author?: string;
  publishedDate?: string;
  highlights?: string[];
}

interface DraftStat {
  label: string;
  value: string;
  sourceId: string;
}

interface DraftSection {
  heading: string;
  paragraphs: string[];
  stats?: DraftStat[];
  callToAction?: string;
  imagePrompt: string;
  focusKeywords?: string[];
}

const blogDraftSchema = z.object({
  title: z.string().min(10),
  intro: z.string().min(40),
  tldr: z.object({
    summary: z.string().min(20),
    bulletPoints: z.array(z.string().min(10)).min(3),
  }),
  sections: z.array(
    z.object({
      heading: z.string().min(6),
      paragraphs: z.array(z.string().min(20)).min(2),
      stats: z
        .array(
          z.object({
            label: z.string().min(3),
            value: z.string().min(1),
            sourceId: z.string().min(1),
          }),
        )
        .optional(),
      callToAction: z.string().optional(),
      imagePrompt: z.string().min(5),
      focusKeywords: z.array(z.string().min(3)).optional(),
    }),
  ),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(20),
      }),
    )
    .min(3),
  conclusion: z.string().min(40),
  meta: z
    .object({
      seoTitle: z.string().min(10),
      seoDescription: z.string().min(40),
      keywords: z.array(z.string().min(3)).min(5),
    })
    .optional(),
});

type BlogDraft = z.infer<typeof blogDraftSchema>;

const extractJsonSegment = (value: string) => {
  const startIndex = value.indexOf("{");
  const endIndex = value.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return value;
  }
  return value.slice(startIndex, endIndex + 1);
};

const normalizeJsonText = (value: string) =>
  value.replace(/\r/g, "").replace(/\u00a0/g, " ").replace(/\u2028|\u2029/g, "");

const describeError = (error: unknown) => (error instanceof Error ? error.message : "unknown error");

export interface BlogSection extends Omit<DraftSection, "imagePrompt"> {
  id: string;
  anchor: string;
  imageQuery: string;
  image?: UnsplashImage | null;
}

export interface BlogGenerationResult {
  title: string;
  intro: string;
  tldr: BlogDraft["tldr"];
  sections: BlogSection[];
  faqs: BlogDraft["faqs"];
  conclusion: string;
  meta?: BlogDraft["meta"];
  sources: BlogSource[];
}

function buildResearchContext(sources: BlogSource[]): string {
  return sources
    .map((source) => {
      const cleanedSummary = source.summary ?? "";
      const highlights = source.highlights?.length
        ? `Key quotes: ${source.highlights.join(" | ")}.`
        : "";
      return `${source.id}: ${source.title} — ${source.url} — ${cleanedSummary}. ${highlights}`;
    })
    .join("\n");
}

interface SanitizeContext {
  primaryKeyword: string;
  answerPrompt: string;
}

function buildFallbackParagraph(context: SanitizeContext): string {
  const prompt = context.answerPrompt.trim();
  const keyword = context.primaryKeyword.trim();
  if (prompt) {
    return `Answering ${prompt} with data-backed insights and actionable recommendations.`;
  }
  return `Exploring ${keyword} with data-backed insights and actionable recommendations.`;
}

function buildFallbackImagePrompt(context: SanitizeContext): string {
  const prompt = context.answerPrompt.trim();
  const keyword = context.primaryKeyword.trim();
  const subject = prompt || keyword || "topic";
  return `Editorial photo illustrating ${subject.toLowerCase()} with modern lighting, cinematic composition, and professional styling`;
}

function buildFallbackFaq(context: SanitizeContext): { question: string; answer: string } {
  const prompt = context.answerPrompt.trim();
  const keyword = context.primaryKeyword.trim();
  const topic = prompt || keyword || "this topic";
  return {
    question: `What is the first step to act on ${topic}?`,
    answer:
      "Prioritize the most immediate actions outlined above, track results weekly, and review source data each month to keep your strategy aligned with the latest insights.",
  };
}

function sanitizeDraftShape(raw: unknown, context: SanitizeContext): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const draft = raw as Record<string, unknown>;

  if (!draft.conclusion || typeof draft.conclusion !== "string" || draft.conclusion.trim().length === 0) {
    const tldrSummary =
      typeof draft.tldr === "object" && draft.tldr && typeof (draft.tldr as Record<string, unknown>).summary === "string"
        ? ((draft.tldr as Record<string, unknown>).summary as string).trim()
        : "";

    draft.conclusion = tldrSummary
      ? `In summary, ${tldrSummary}`
      : "In summary, the evidence above details the primary opportunities and critical actions to pursue.";
  }

  if (!Array.isArray(draft.sections)) {
    draft.sections = [];
  }

  const fallbackParagraph = buildFallbackParagraph(context);
  const fallbackImagePrompt = buildFallbackImagePrompt(context);

  draft.sections = (draft.sections as unknown[])
    .filter((section): section is Record<string, unknown> => typeof section === "object" && section !== null)
    .map((section) => {
      const normalized = { ...section } as Record<string, unknown>;

      const heading = typeof normalized.heading === "string" ? normalized.heading.trim() : "Key Insight";
      normalized.heading = heading.length ? heading : "Key Insight";

      const paragraphs = Array.isArray(normalized.paragraphs) ? normalized.paragraphs : [];
      const cleanedParagraphs = paragraphs
        .filter((paragraph): paragraph is string => typeof paragraph === "string" && paragraph.trim().length > 0)
        .map((paragraph) => paragraph.trim());
      if (cleanedParagraphs.length === 0) {
        cleanedParagraphs.push(fallbackParagraph);
      }
      if (cleanedParagraphs.length === 1) {
        cleanedParagraphs.push(`${cleanedParagraphs[0]} This perspective builds on the data above and connects the insight back to tangible actions.`);
      }
      normalized.paragraphs = cleanedParagraphs;

      if (Array.isArray(normalized.stats)) {
        const cleanedStats = normalized.stats
          .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
          .map((entry) => {
            const stat = { ...entry } as Record<string, unknown>;
            const label = typeof stat.label === "string" ? stat.label.trim() : "";
            const value = typeof stat.value === "string" ? stat.value.trim() : "";
            const sourceId = typeof stat.sourceId === "string" ? stat.sourceId.trim() : "";
            if (!label || !value || !sourceId) {
              return null;
            }
            stat.label = label;
            stat.value = value;
            stat.sourceId = sourceId;
            return stat;
          })
          .filter((stat): stat is Record<string, unknown> => stat !== null);
        normalized.stats = cleanedStats.length ? cleanedStats : undefined;
      } else {
        delete normalized.stats;
      }

      if (typeof normalized.imagePrompt === "string") {
        const cleanedPrompt = normalized.imagePrompt.trim();
        normalized.imagePrompt = cleanedPrompt.length ? cleanedPrompt : fallbackImagePrompt;
      } else {
        normalized.imagePrompt = fallbackImagePrompt;
      }

      return normalized;
    });

  if ((draft.sections as unknown[]).length === 0) {
    draft.sections = [
      {
        heading: "Overview",
        paragraphs: [fallbackParagraph],
        imagePrompt: fallbackImagePrompt,
      },
    ];
  }

  if (!Array.isArray(draft.faqs)) {
    draft.faqs = [];
  }

  const fallbackFaq = buildFallbackFaq(context);

  draft.faqs = (draft.faqs as unknown[])
    .filter((faq): faq is Record<string, unknown> => typeof faq === "object" && faq !== null)
    .map((faq) => {
      const normalized = { ...faq } as Record<string, unknown>;
      const question = typeof normalized.question === "string" ? normalized.question.trim() : "";
      const answer = typeof normalized.answer === "string" ? normalized.answer.trim() : "";
      normalized.question = question.length ? question : fallbackFaq.question;
      normalized.answer = answer.length ? answer : fallbackFaq.answer;
      return normalized;
    });

  while ((draft.faqs as unknown[]).length < 3) {
    (draft.faqs as Record<string, unknown>[]).push({ ...fallbackFaq });
  }

  return draft;
}

function decodeClaudeJson(content: string, context: SanitizeContext): BlogDraft {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const normalized = normalizeJsonText(trimmed);
  const extracted = extractJsonSegment(normalized);

  const parseDraft = (value: string) => {
    const parsed = sanitizeDraftShape(JSON.parse(value), context) as unknown;
    return blogDraftSchema.parse(parsed);
  };

  try {
    return parseDraft(extracted);
  } catch (initialError) {
    try {
      const repaired = jsonrepair(extracted);
      return parseDraft(repaired);
    } catch (repairError) {
      try {
        const normalizedRepair = jsonrepair(normalized);
        return parseDraft(normalizedRepair);
      } catch (normalizedError) {
        throw new Error(
          `Failed to parse Claude response as JSON. Original error: ${describeError(
            initialError,
          )}; Repair attempt: ${describeError(repairError)}; Normalized repair: ${describeError(normalizedError)}`,
        );
      }
    }
  }
}

const bannedSectionPhrases = [
  "New Construction Standard — ENERGY STAR and LEED Certified",
  "Compare new construction developments with existing renovated properties to determine the best fit for your needs.",
  "new construction green homes Austin",
  "existing sustainable homes Austin",
  "renovated eco-friendly homes",
  "LEED new construction Austin",
];

function sectionIncludesBannedContent(section: BlogSection): boolean {
  const phrases = bannedSectionPhrases.map((phrase) => phrase.toLowerCase());

  const textMatches = (
    section.paragraphs?.some((paragraph) =>
      phrases.some((phrase) => paragraph.toLowerCase().includes(phrase)),
    ) ?? false
  );

  const statsMatches = section.stats?.some((stat) =>
    phrases.some(
      (phrase) =>
        stat.label.toLowerCase().includes(phrase) ||
        stat.value.toLowerCase().includes(phrase),
    ),
  );

  const ctaMatches = section.callToAction
    ? phrases.some((phrase) => section.callToAction?.toLowerCase().includes(phrase))
    : false;

  const focusMatches = section.focusKeywords?.some((keyword) =>
    phrases.some((phrase) => keyword.toLowerCase().includes(phrase)),
  );

  return textMatches || statsMatches || ctaMatches || focusMatches || false;
}

export async function generateBlog(input: BlogGenerationInput): Promise<BlogGenerationResult> {
  const {
    primaryKeyword,
    secondaryKeyword,
    answerPrompt,
    location,
    audience,
    tone,
    wordCountGoal,
    countryCode,
    language,
    brief,
  } = input;

  if (!primaryKeyword) {
    throw new Error("primaryKeyword is required");
  }

  if (!answerPrompt) {
    throw new Error("answerPrompt is required");
  }

  const normalizedCountryCode = countryCode
    ? countryCode.trim().slice(0, 2).toUpperCase()
    : undefined;

  const searchQuery = [
    primaryKeyword,
    secondaryKeyword,
    answerPrompt,
    location,
    "statistics",
    "market data",
  ]
    .filter(Boolean)
    .join(" ");

  const exaResponse = await searchExa(searchQuery, {
    numResults: 12,
    type: "auto",
    userLocation: normalizedCountryCode,
  });

  const sources: BlogSource[] = exaResponse.results.slice(0, 12).map((result, index) => ({
    id: `source-${index + 1}`,
    title: result.title,
    url: result.url,
    summary: result.summary ?? result.text?.slice(0, 280),
    author: result.author,
    publishedDate: result.publishedDate,
    highlights: result.highlights,
  }));

  if (sources.length === 0) {
    throw new Error("Exa API returned no results for the provided keywords.");
  }

  const researchContext = buildResearchContext(sources);

  const seoDescriptor = [
    `Primary keyword: ${primaryKeyword}`,
    secondaryKeyword ? `Secondary keyword: ${secondaryKeyword}` : null,
    `Focus question: ${answerPrompt}`,
    location ? `Geo focus: ${location}` : null,
    audience ? `Audience: ${audience}` : null,
    (tone ?? "data-driven and statistics-backed")
      ? `Preferred tone: ${tone ?? "data-driven and statistics-backed"}`
      : null,
    wordCountGoal ? `Target word count: ~${wordCountGoal}` : null,
    (language ?? "English") ? `Language: ${language ?? "English"}` : null,
    brief ? `Strategic brief: ${brief}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = [
    "You are an expert SEO strategist and editorial writer.",
    "Craft geo-targeted, conversion-focused blog content with impeccable structure.",
    "Respect the provided JSON schema exactly and never include prose outside JSON.",
    "Embed hyperlinks using the provided sources by inserting markers in the format <<source-id|Anchor Text>> within paragraphs.",
    "In each section, create at least two paragraphs and reference at least one provided source. Highlight any statistics inside the stats array.",
    "Maintain a data-driven, statistics-rich voice throughout.",
    "Integrate quantitative evidence directly inside body paragraphs—do not produce standalone key-stat or keyword callout sections.",
  ].join(" ");

  const schemaDescription = `
Return JSON with the following shape:
{
  "title": string,
  "intro": string,
  "tldr": {
    "summary": string,
    "bulletPoints": string[]
  },
  "sections": [
    {
      "heading": string,
      "paragraphs": string[],
      "stats": [
        { "label": string, "value": string, "sourceId": string }
      ],
      "callToAction": string?,
      "imagePrompt": string,
      "focusKeywords": string[]
    }
  ],
  "faqs": [
    { "question": string, "answer": string }
  ],
  "conclusion": string,
  "meta": {
    "seoTitle": string,
    "seoDescription": string,
    "keywords": string[]
  }
}
`;

  const exemplarGuidance = `Style cues inspired by seoexample.txt (structure only, do not reuse any wording):
- Open with approachable, empathetic paragraphs that acknowledge the reader's problem before transitioning into clarity.
- Let each H2 pose or answer a specific question, mirroring educational blog flow.
- Explain concepts plainly, define jargon in-line, and interleave statistics naturally within paragraphs rather than in separate boxes.
- Use short declarative sentences mixed with reassuring guidance, similar to an experienced SEO coach.
- Maintain smooth transitions so the article reads like one continuous Google Doc ready for publishing.`;

  const userPrompt = `
${seoDescriptor}

Sources:
${researchContext}

Instructions:
- Use the sources responsibly; do not invent URLs or stats.
- When referencing a source, insert <<source-id|Anchor Text>> where the anchor text should be linked.
- Keep paragraphs concise (120-180 words) and skimmable.
- Provide "imagePrompt" values that describe a scene suitable for Unsplash (avoid mentioning brand names).
- The "stats" array should capture numeric insights with their sourceId.
- Integrate statistics and keyword mentions naturally within paragraphs; do not output dedicated "Key stats" or "Focus keywords" sections.
- Maintain a professional yet approachable tone aligned with the audience.
- Frame the narrative to directly answer the long-tail question: ${answerPrompt}.
${brief ? `- Integrate the strategic brief requirements: ${brief}` : ""}

${exemplarGuidance}

Only output valid JSON.
`;

  const claudeResponse = await sendClaudeMessage({
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${schemaDescription}\n${userPrompt}`,
          },
        ],
      },
    ],
    maxOutputTokens: 4096,
    temperature: 0.6,
  });

  const [firstBlock] = claudeResponse.content;
  if (!firstBlock || firstBlock.type !== "text") {
    throw new Error("Claude response missing text content");
  }

  const draft = decodeClaudeJson(firstBlock.text, {
    primaryKeyword,
    answerPrompt,
  });

  const sectionsWithImages: BlogSection[] = (
    await Promise.all(
      draft.sections.map(async (section) => {
        const anchor = toAnchorSlug(section.heading);
        const imageQueryParts = [
          section.imagePrompt,
          primaryKeyword,
          location,
        ]
          .filter(Boolean)
          .join(" ");
        const image = await findUnsplashImage(imageQueryParts);
        return {
          id: anchor,
          anchor,
          heading: section.heading,
          paragraphs: section.paragraphs,
          stats: section.stats,
          callToAction: section.callToAction,
          focusKeywords: section.focusKeywords,
          imageQuery: imageQueryParts,
          image,
        };
      }),
    )
  ).filter((section) => !sectionIncludesBannedContent(section));

  return {
    title: draft.title,
    intro: draft.intro,
    tldr: draft.tldr,
    sections: sectionsWithImages,
    faqs: draft.faqs,
    conclusion: draft.conclusion,
    meta: draft.meta,
    sources,
  };
}
