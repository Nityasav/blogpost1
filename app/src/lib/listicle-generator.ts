import { sendClaudeMessage } from "@/lib/clients/claude";
import { searchExa } from "@/lib/clients/exa";
import { generateBlog } from "@/lib/blog-generator";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

export const listicleRequestSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters long"),
  prompts: z
    .array(z.string().min(10, "Each prompt must be at least 10 characters"))
    .length(5, "Provide exactly five prompts"),
  platforms: z
    .array(z.string().min(2, "Platform name too short"))
    .min(1, "Select at least one platform"),
});

export type ListicleRequestInput = z.infer<typeof listicleRequestSchema>;

const listicleSuggestionSchema = z.object({
  title: z.string().min(12),
  subtitle: z.string().min(6),
  summary: z.string().min(40),
  platformFocus: z.string().min(3),
  keyTakeaways: z.array(z.string().min(8)).min(2),
  competitorHighlights: z.array(z.string().min(12)).min(2),
});

const listicleResponseSchema = z.object({
  suggestions: z.array(listicleSuggestionSchema).min(3).max(7),
  editorialDirection: z.string().min(20).optional(),
});

export type ListicleSuggestion = z.infer<typeof listicleSuggestionSchema>;
export type ListicleComparativeResult = z.infer<typeof listicleResponseSchema>;

export const listicleArticleRequestSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters long"),
  prompts: z
    .array(z.string().min(10, "Each prompt must be at least 10 characters"))
    .length(5, "Provide exactly five prompts"),
  platforms: z
    .array(z.string().min(2, "Platform name too short"))
    .min(1, "Select at least one platform"),
  suggestion: listicleSuggestionSchema,
  editorialDirection: z.string().min(10).optional(),
});

export type ListicleArticleRequestInput = z.infer<typeof listicleArticleRequestSchema>;

function extractJson(content: string): string {
  const trimmed = content.trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return withoutFence;
  }
  return withoutFence.slice(start, end + 1);
}

export async function generateListicleComparisons(input: ListicleRequestInput): Promise<ListicleComparativeResult> {
  const { topic, prompts, platforms } = listicleRequestSchema.parse(input);

  const researchQuery = [topic, ...prompts].join(" ");

  const exaResponse = await searchExa(researchQuery, {
    numResults: 15,
    type: "auto",
  });

  const sources = exaResponse.results.slice(0, 12);

  if (!sources.length) {
    throw new Error("Unable to source competitor research for the provided inputs.");
  }

  const researchContext = sources
    .map((source, index) => {
      const summary = source.summary ?? source.text?.slice(0, 220) ?? "";
      const highlights = source.highlights?.length ? `Highlights: ${source.highlights.join(" | ")}` : "";
      return `[${index + 1}] ${source.title} — ${source.url}\n${summary}\n${highlights}`.trim();
    })
    .join("\n\n");

  const promptsList = prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n");
  const platformList = platforms.join(", ");

  const system = [
    "You are a senior content strategist and market researcher.",
    "Generate comparative listicle concepts that synthesize competitive intelligence and SEO opportunities.",
    "Always respond with strict JSON matching the provided schema.",
    "Use research insights to highlight competitors, market gaps, and differentiators.",
  ].join(" ");

  const schemaDescription = `Return JSON with this shape:
{
  "suggestions": [
    {
      "title": string,
      "subtitle": string,
      "summary": string,
      "platformFocus": string,
      "keyTakeaways": string[],
      "competitorHighlights": string[]
    }
  ],
  "editorialDirection": string?
}`;

  const userInstructions = `Topic: ${topic}
Platforms to optimize for: ${platformList}
Prompts to answer:
${promptsList}

Research notes (use these sources for evidence and comparison, cite by number in competitorHighlights):
${researchContext}

Requirements:
- Combine the five prompts into one coherent comparative listicle approach.
- Produce 4-6 unique title concepts that mirror competitive roundup headlines.
- Each title must feel data-backed and feature a year or metric when appropriate.
- The subtitle should be a short positioning phrase (for example, "Buyer’s Guide" or "Market Outlook").
- Summaries should outline how the article would break down the market and call out the angle.
- Platform focus must explicitly reference one or more of the requested platforms.
- keyTakeaways should note intent, primary CTA, and SEO opportunities in short phrases.
- competitorHighlights should cite two or more notable competitors using the format "[source-number] insight".
- Keep language crisp, persuasive, and ready for executive review.
- Do not invent URLs or competitors beyond what the research provides.`;

  const claudeResponse = await sendClaudeMessage({
    system,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${schemaDescription}\n\n${userInstructions}`,
          },
        ],
      },
    ],
    maxOutputTokens: 2048,
    temperature: 0.5,
  });

  const [firstBlock] = claudeResponse.content;
  if (!firstBlock || firstBlock.type !== "text") {
    throw new Error("Claude response missing text content");
  }

  const extracted = extractJson(firstBlock.text);

  const repaired = jsonrepair(extracted);
  const parsed = JSON.parse(repaired);

  return listicleResponseSchema.parse(parsed);
}

const deriveRankTarget = (title: string): number | null => {
  const rankMatch = title.match(/(?:Top|Best)\s+(\d{1,2})/i);
  if (rankMatch?.[1]) {
    return Number.parseInt(rankMatch[1], 10);
  }
  return null;
};

export async function generateListicleArticle(input: ListicleArticleRequestInput) {
  const { topic, prompts, platforms, suggestion, editorialDirection } = listicleArticleRequestSchema.parse(input);

  const trimmedPrompts = prompts.map((prompt) => prompt.trim());
  const promptsBlock = trimmedPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n");
  const platformList = platforms.join(", ");
  const highlightsBlock = suggestion.competitorHighlights.join("\n");
  const rankTarget = deriveRankTarget(suggestion.title) ?? 10;

  const briefSections = [
    `Prompts to cover in depth:\n${promptsBlock}`,
    `Platform optimization guidance must reference: ${platformList}. Describe how the narrative ties back to each platform (distribution strategy, prompt engineering angles, repurposing tactics).`,
    `Ensure the article explicitly ranks competitors in a numbered list from 1 to ${rankTarget}, providing quantitative evidence and positioning for each vendor.`,
    `Incorporate these competitor insights verbatim where relevant to support your ranking decisions:\n${highlightsBlock}`,
    suggestion.summary ? `Angle summary from concept: ${suggestion.summary}` : null,
    editorialDirection ? `Editorial direction: ${editorialDirection}` : null,
    `Structure requirements: include TL;DR, Table of Contents, dedicated sections for each ranked competitor, Key Features/Tips section, FAQ, and Conclusion. Maintain a data-backed analyst tone and supply actionable buyer guidance.`,
  ].filter(Boolean);

  const brief = briefSections.join("\n\n");

  const answerPrompt = `Produce a ${rankTarget}-entry comparative listicle titled "${suggestion.title}" that evaluates the leading ${topic} for ${new Date().getFullYear()} buyers.`;

  const blog = await generateBlog({
    primaryKeyword: suggestion.title,
    secondaryKeyword: topic,
    answerPrompt,
    tone: `Analyst-grade, statistics-backed narrative optimized for ${platformList}`,
    language: "English",
    brief,
  });

  return blog;
}
