"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Sparkles, Target, Shield } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";

const outlineSections = [
  {
    id: "overview",
    title: "Product overview",
    description: "Summarize what the product is and why it matters for newcomers.",
  },
  {
    id: "audience",
    title: "Audience alignment",
    description: "Explain who benefits most from the product and their core needs.",
  },
  {
    id: "differentiators",
    title: "Key differentiators",
    description: "Highlight the product's standout capabilities and advantages.",
  },
  {
    id: "proof",
    title: "Proof points",
    description: "Share metrics, testimonials, or evidence that reinforce credibility.",
  },
] as const;

type FieldKey = "productName" | "productCategory" | "primaryAudience" | "coreBenefits" | "supportingEvidence";

const defaultFieldState: Record<FieldKey, string> = {
  productName: "",
  productCategory: "",
  primaryAudience: "",
  coreBenefits: "",
  supportingEvidence: "",
};

const WhatIsProductCreatePage = () => {
  const [fieldState, setFieldState] = useState(defaultFieldState);

  const handleFieldChange = useCallback(
    (key: FieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldState((previous) => ({ ...previous, [key]: event.target.value }));
    },
  []);

  const handleOutlineGenerate = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const hasPreviewDetails = useMemo(() => Object.values(fieldState).some((value) => value.trim().length > 0), [fieldState]);

  const topBar = useMemo(
    () => (
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#1F2A6B]">What is product Template</h1>
        <Button href="/blogpost" variant="ghost" className="rounded-full px-4 py-2 text-sm text-[#1F2A6B]/80 hover:text-[#1F2A6B]">
          Back to dashboard
        </Button>
      </div>
    ),
    [],
  );

  const previewHeader = useMemo(() => {
    if (!hasPreviewDetails) {
      return "Configure your product story";
    }

    return `Introducing ${fieldState.productName || "your product"}`;
  }, [fieldState.productName, hasPreviewDetails]);

  return (
    <BlogpostShell topBar={topBar}>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
        <form
          onSubmit={handleOutlineGenerate}
          className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Template configuration</p>
            <p className="text-xs text-slate-400">Craft a clear, credible explanation of what your product is and why it matters.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2A6B]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  What is it?
                </span>
                <span className="text-xs text-[#1F2A6B]/70">Perfect for educational one-pagers and landing page hero copy.</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label htmlFor="product-name" className="text-sm font-medium text-slate-700">
                Product name
              </label>
              <input
                id="product-name"
                name="product-name"
                value={fieldState.productName}
                onChange={handleFieldChange("productName")}
                placeholder="e.g. Antifragility Insight Engine"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="product-category" className="text-sm font-medium text-slate-700">
                Product category
              </label>
              <input
                id="product-category"
                name="product-category"
                value={fieldState.productCategory}
                onChange={handleFieldChange("productCategory")}
                placeholder="e.g. AI-powered GTM intelligence platform"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="primary-audience" className="text-sm font-medium text-slate-700">
                Primary audience
              </label>
              <textarea
                id="primary-audience"
                name="primary-audience"
                value={fieldState.primaryAudience}
                onChange={handleFieldChange("primaryAudience")}
                placeholder="Describe who benefits the most and why they are searching for a solution."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="core-benefits" className="text-sm font-medium text-slate-700">
                Core benefits
              </label>
              <textarea
                id="core-benefits"
                name="core-benefits"
                value={fieldState.coreBenefits}
                onChange={handleFieldChange("coreBenefits")}
                placeholder="List the top features or capabilities and how they create business value."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="supporting-evidence" className="text-sm font-medium text-slate-700">
                Supporting evidence
              </label>
              <textarea
                id="supporting-evidence"
                name="supporting-evidence"
                value={fieldState.supportingEvidence}
                onChange={handleFieldChange("supportingEvidence")}
                placeholder="Share proof points, customer quotes, or performance metrics that validate the product."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate product outline">
              Generate Outline
            </Button>
          </div>
        </form>

        <div className="flex min-h-[420px] flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">{previewHeader}</p>
              <p className="text-xs text-slate-500">Approved outline, hook, proof points, and CTA will render here.</p>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-blue-500/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-blue-600 md:inline-flex">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Focused
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
            {hasPreviewDetails ? (
              <ul className="space-y-4 text-sm text-slate-600">
                {outlineSections.map(({ id, title, description }) => (
                  <li key={id} className="space-y-1 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[#1F2A6B]">
                      <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-sm font-semibold">{title}</span>
                    </div>
                    <p className="text-xs text-slate-500">{description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                <p>Complete the fields to preview your product narrative.</p>
                <p className="text-xs text-slate-400">Each section adapts to your responses automatically.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlogpostShell>
  );
};

export default WhatIsProductCreatePage;
