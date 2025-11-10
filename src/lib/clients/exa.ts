import { getEnv } from "@/lib/env";

const EXA_API_URL = "https://api.exa.ai/search";

export interface ExaSearchOptions {
  numResults?: number;
  type?: "auto" | "neural" | "keyword" | "fast";
  includeDomains?: string[];
  excludeDomains?: string[];
  startPublishedDate?: string;
  endPublishedDate?: string;
  userLocation?: string;
}

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
  image?: string;
  favicon?: string;
}

interface ExaSearchResponse {
  requestId: string;
  resolvedSearchType: string;
  results: ExaSearchResult[];
}

export async function searchExa(
  query: string,
  options: ExaSearchOptions = {},
): Promise<ExaSearchResponse> {
  const env = getEnv();

  const body: Record<string, unknown> = {
    query,
    numResults: options.numResults ?? 10,
    type: options.type ?? "auto",
    includeDomains: options.includeDomains,
    excludeDomains: options.excludeDomains,
    startPublishedDate: options.startPublishedDate,
    endPublishedDate: options.endPublishedDate,
    userLocation: options.userLocation,
    text: true,
    summary: true,
    highlights: true,
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key];
    }
  });

  const response = await fetch(EXA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.EXA_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Exa API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ExaSearchResponse;

  return data;
}

