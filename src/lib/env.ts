import { z } from "zod";

const envSchema = z.object({
  CLAUDE_API_KEY: z
    .string()
    .min(1, "Missing CLAUDE_API_KEY. Set it in your environment variables."),
  CLAUDE_MODEL: z
    .string()
    .min(1)
    .default("claude-3-5-sonnet-20241022"),
  EXA_API_KEY: z
    .string()
    .min(1, "Missing EXA_API_KEY. Set it in your environment variables."),
  UNSPLASH_ACCESS_KEY: z
    .string()
    .min(1, "Missing UNSPLASH_ACCESS_KEY. Set it in your environment variables."),
});

export interface AppEnv {
  CLAUDE_API_KEY: string;
  CLAUDE_MODEL: string;
  EXA_API_KEY: string;
  UNSPLASH_ACCESS_KEY: string;
}

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse({
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    CLAUDE_MODEL: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022",
    EXA_API_KEY: process.env.EXA_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(message);
  }

  return parsed.data;
}

