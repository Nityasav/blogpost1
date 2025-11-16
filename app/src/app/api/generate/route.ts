import { handleGenerateRequest } from "@/features/blog-generator/server/generate";

export async function POST(request: Request) {
  return handleGenerateRequest(request);
}
