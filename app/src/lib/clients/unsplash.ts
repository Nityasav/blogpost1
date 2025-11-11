import { getEnv } from "@/lib/env";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

export interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  photographerName: string;
  photographerUsername: string;
  photographerProfile: string;
  width: number;
  height: number;
  color?: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: Array<{
    id: string;
    alt_description: string | null;
    description: string | null;
    width: number;
    height: number;
    color: string | null;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    user: {
      name: string;
      username: string;
      links: {
        html: string;
      };
    };
  }>;
}

export async function findUnsplashImage(query: string): Promise<UnsplashImage | null> {
  const env = getEnv();

  const url = new URL(UNSPLASH_API_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "3");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
    next: {
      revalidate: 60 * 15,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unsplash API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as UnsplashSearchResponse;
  const [primary] = data.results;

  if (!primary) {
    return null;
  }

  return {
    id: primary.id,
    url: primary.urls.regular,
    alt: primary.alt_description ?? primary.description ?? query,
    photographerName: primary.user.name,
    photographerUsername: primary.user.username,
    photographerProfile: primary.user.links.html,
    width: primary.width,
    height: primary.height,
    color: primary.color ?? undefined,
  };
}
