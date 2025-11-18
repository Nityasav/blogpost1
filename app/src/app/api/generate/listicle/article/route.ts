import { NextResponse } from "next/server";
import { generateListicleArticle, listicleArticleRequestSchema } from "@/lib/listicle-generator";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = listicleArticleRequestSchema.parse(payload);
    const article = await generateListicleArticle(input);
    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

