import { NextResponse } from "next/server";
import { generateListicleComparisons, listicleRequestSchema } from "@/lib/listicle-generator";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = listicleRequestSchema.parse(payload);
    const result = await generateListicleComparisons(input);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

