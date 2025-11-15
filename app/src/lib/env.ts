import { z } from "zod";

const nonEmptyString = (field: string, hint?: string) =>
  z.string().min(1, hint ?? `${field} cannot be empty. Set it in your .env.local.`);

const envSchema = z.object({
  CLAUDE_API_KEY: nonEmptyString("CLAUDE_API_KEY"),
  CLAUDE_MODEL: z.string().min(1, "CLAUDE_MODEL cannot be empty").default("claude-3-5-sonnet-20241022"),
  EXA_API_KEY: nonEmptyString("EXA_API_KEY"),
  UNSPLASH_ACCESS_KEY: nonEmptyString("UNSPLASH_ACCESS_KEY"),
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
    const { fieldErrors } = parsed.error.flatten();
    const missing = Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([key, messages]) => `${key}: ${messages?.join(", ")}`);

    const hint = missing.length
      ? `Missing environment configuration. ${missing.join("; ")} Define these in app/.env.local.`
      : parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
          .join("; ");

    throw new Error(hint);
  }

  return parsed.data;
}
