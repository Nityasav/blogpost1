import { generateBlog } from "@/lib/blog-generator";
import { z } from "zod";

const requestSchema = z.object({
  primaryKeyword: z.string().min(3),
  secondaryKeyword: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    }),
  answerPrompt: z.string().min(10),
  location: z.string().optional(),
  countryCode: z
    .string()
    .length(2)
    .optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  wordCountGoal: z.number().int().positive().max(8000).optional(),
  language: z.string().optional(),
  brief: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = requestSchema.parse(payload);

    const result = await generateBlog(input);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: "Invalid request payload",
          issues: error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
