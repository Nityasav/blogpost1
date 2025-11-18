import { NextResponse } from "next/server";

const templates = {
  suggested: {
    title: "Suggested",
    description: "Use AI to auto-suggest the best blog structure based on data insights.",
    topics: ["AI Content Optimization", "SEO Strategy", "Market Trends"],
    prompts: [
      "What are the key trends for {topic}?",
      "Explain the benefits of adopting {topic} for small businesses",
      "Provide data-backed proof points for {topic}",
      "What are the common objections to {topic}?",
      "Offer step-by-step implementation guidance for {topic}",
    ],
    platforms: ["ChatGPT", "Google AI Overviews", "Perplexity"],
    citationsPlaceholder: "Select citations (max 20)",
    brandKitPlaceholder: "Select a brand kit (optional)",
  },
  listicle: {
    title: "Listicle",
    description: "Create a listicle blog post",
    topics: ["Listicle Headlines", "Quick Wins", "Best Practices"],
    prompts: [
      "List the top 10 essentials for {topic}",
      "Provide quick wins readers can try today",
      "Summarize real-world examples that prove the value of {topic}",
      "Highlight expert tips and tricks for {topic}",
      "Offer downloadable/checklist CTA ideas for {topic}",
    ],
    platforms: ["LinkedIn", "Medium", "Newsletter"],
    citationsPlaceholder: "Select listicle proof points",
    brandKitPlaceholder: "Attach a brand kit (optional)",
  },
  "how-to": {
    title: "How-To Guide",
    description: "Step-by-step instructions to accomplish a specific task",
    topics: ["Guided Playbook", "Implementation Roadmap", "Troubleshooting"],
    prompts: [
      "Outline the prerequisites for {topic}",
      "Provide numbered steps to complete {topic}",
      "Share a troubleshooting checklist",
      "Offer resource/toolkit suggestions",
      "Wrap up with measurable success metrics",
    ],
    platforms: ["Blog", "YouTube", "Internal Wiki"],
    citationsPlaceholder: "Select reference manuals",
    brandKitPlaceholder: "Attach style guide (optional)",
  },
  comparison: {
    title: "Comparison",
    description: "Compare your solution with competitors",
    topics: ["Competitive Insights", "Differentiators", "Feature Matrix"],
    prompts: [
      "Provide a feature-by-feature comparison for {topic}",
      "Highlight the unique selling points of our approach",
      "Summarize competitor weaknesses",
      "Share analyst reports or third-party reviews",
      "Conclude with a persuasive CTA",
    ],
    platforms: ["Marketing Site", "Sales Deck", "Analyst Brief"],
    citationsPlaceholder: "Select supporting research",
    brandKitPlaceholder: "Attach comparison design kit (optional)",
  },
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("id") as keyof typeof templates | null;

  if (!templateId || !(templateId in templates)) {
    return NextResponse.json({ message: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(templates[templateId], { status: 200 });
}

