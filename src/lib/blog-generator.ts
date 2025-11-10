import { sendClaudeMessage } from "@/lib/clients/claude";
import { searchExa } from "@/lib/clients/exa";
import { findUnsplashImage, UnsplashImage } from "@/lib/clients/unsplash";
import { toAnchorSlug } from "@/lib/slug";
import { z } from "zod";

export interface BlogGenerationInput {
  primaryKeyword: string;
  secondaryKeyword?: string;
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

function decodeClaudeJson(content: string): BlogDraft {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(trimmed) as unknown;
  return blogDraftSchema.parse(parsed);
}

export async function generateBlog(input: BlogGenerationInput): Promise<BlogGenerationResult> {
  const {
    primaryKeyword,
    secondaryKeyword,
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

  const normalizedCountryCode = countryCode
    ? countryCode.trim().slice(0, 2).toUpperCase()
    : undefined;

  const searchQuery = [
    primaryKeyword,
    secondaryKeyword,
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
    location ? `Geo focus: ${location}` : null,
    audience ? `Audience: ${audience}` : null,
    tone ? `Preferred tone: ${tone}` : null,
    wordCountGoal ? `Target word count: ~${wordCountGoal}` : null,
    language ? `Language: ${language}` : null,
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
- Maintain a professional yet approachable tone aligned with the audience.
${brief ? `- Integrate the strategic brief requirements: ${brief}` : ""}

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

  const draft = decodeClaudeJson(firstBlock.text);

  const sectionsWithImages: BlogSection[] = await Promise.all(
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
  );

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

