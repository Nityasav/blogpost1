"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Scale, ShieldCheck, Sparkle } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";

const ComparisonCreatePage = () => {
  const [primarySolution, setPrimarySolution] = useState("");
  const [primaryDifferentiator, setPrimaryDifferentiator] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [competitorWeakness, setCompetitorWeakness] = useState("");
  const [audienceNeed, setAudienceNeed] = useState("");
  const [proofPoint, setProofPoint] = useState("");

  const handleChange = useCallback((setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(event.target.value);
  }, []);

  const handleGenerate = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const topBar = useMemo(
    () => (
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#1F2A6B]">Comparison Template</h1>
        <Button href="/blogpost" variant="ghost" className="rounded-full px-4 py-2 text-sm text-[#1F2A6B]/80 hover:text-[#1F2A6B]">
          Back to dashboard
        </Button>
      </div>
    ),
    [],
  );

  return (
    <BlogpostShell topBar={topBar}>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
        <form
          onSubmit={handleGenerate}
          className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Comparison Brief</p>
            <p className="text-xs text-slate-400">Highlight strengths, address objections, and build a compelling side-by-side story.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2A6B]">
                  <Scale className="h-4 w-4" aria-hidden="true" />
                  Comparison
                </span>
                <span className="text-xs text-[#1F2A6B]/70">Compare your solution with competitors</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label htmlFor="primary-solution" className="text-sm font-medium text-slate-700">
                Your solution name
              </label>
              <input
                id="primary-solution"
                name="primary-solution"
                value={primarySolution}
                onChange={handleChange(setPrimarySolution)}
                placeholder="e.g. Antifragility Insight Engine"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="primary-differentiator" className="text-sm font-medium text-slate-700">
                Signature differentiator
              </label>
              <textarea
                id="primary-differentiator"
                name="primary-differentiator"
                value={primaryDifferentiator}
                onChange={handleChange(setPrimaryDifferentiator)}
                placeholder="Summarize the core advantage that wins customers over."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="competitor-name" className="text-sm font-medium text-slate-700">
                Competitor referenced
              </label>
              <input
                id="competitor-name"
                name="competitor-name"
                value={competitorName}
                onChange={handleChange(setCompetitorName)}
                placeholder="e.g. Legacy Analytics Suite"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="competitor-weakness" className="text-sm font-medium text-slate-700">
                Key competitor gap
              </label>
              <textarea
                id="competitor-weakness"
                name="competitor-weakness"
                value={competitorWeakness}
                onChange={handleChange(setCompetitorWeakness)}
                placeholder="Where does the competitor fall short?"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="audience-need" className="text-sm font-medium text-slate-700">
                Audience must-win need
              </label>
              <textarea
                id="audience-need"
                name="audience-need"
                value={audienceNeed}
                onChange={handleChange(setAudienceNeed)}
                placeholder="Describe the outcome or KPI your buyer prioritizes."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="proof-point" className="text-sm font-medium text-slate-700">
                Proof point or testimonial
              </label>
              <textarea
                id="proof-point"
                name="proof-point"
                value={proofPoint}
                onChange={handleChange(setProofPoint)}
                placeholder="Highlight a stat, quote, or case study that reinforces your advantage."
                rows={2}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate comparison outline">
              Generate Comparison Outline
            </Button>
          </div>
        </form>

        <div className="flex min-h-[420px] flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Competitive story preview</p>
              <p className="text-xs text-slate-500">See the positioning narrative we will use in the generated draft.</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            <div className="space-y-2">
              <p className="font-semibold text-[#1F2A6B]">{primarySolution || "Your solution"} vs. {competitorName || "Competitor"}</p>
              <p className="text-xs text-slate-500">Buyer focus: {audienceNeed || "Articulate what your buyer must achieve"}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-xs text-slate-600">
              <div className="space-y-1">
                <p className="font-semibold text-[#1F2A6B]">Why you win</p>
                <p>{primaryDifferentiator || "Clarify the strategic edge of your platform."}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#1F2A6B]">Where they fall short</p>
                <p>{competitorWeakness || "Outline the friction points buyers experience today."}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 text-xs text-blue-700">
              <Sparkle className="mr-2 inline h-3.5 w-3.5" aria-hidden="true" />
              {proofPoint || "Add a proof point or testimonial to reinforce credibility."}
            </div>
          </div>
        </div>
      </div>
    </BlogpostShell>
  );
};

export default ComparisonCreatePage;
