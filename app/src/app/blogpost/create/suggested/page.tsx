"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Database, LineChart, Users } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";

const SuggestedCreatePage = () => {
  const [brandName, setBrandName] = useState("");
  const [focusAudience, setFocusAudience] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [keyMetric, setKeyMetric] = useState("");
  const [dataSource, setDataSource] = useState("First-party analytics");

  const handleTextChange = useCallback((setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(event.target.value);
  }, []);

  const handleDataSourceChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setDataSource(event.target.value);
  }, []);

  const handleGenerate = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const filledAudience = focusAudience || "Growth marketing leaders";
  const filledGoal = businessGoal || "increase qualified pipeline";
  const filledMetric = keyMetric || "demo conversions";

  const topBar = useMemo(
    () => (
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#1F2A6B]">Suggested Template</h1>
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
            <p className="text-sm font-medium text-slate-700">Insight Configuration</p>
            <p className="text-xs text-slate-400">Tell us what matters so we can auto-suggest a data-backed angle.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2A6B]">
                  <Database className="h-4 w-4" aria-hidden="true" />
                  Suggested
                </span>
                <span className="text-xs text-[#1F2A6B]/70">Use Bear's data insights to auto-suggest</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label htmlFor="brand-name" className="text-sm font-medium text-slate-700">
                Brand or product name
              </label>
              <input
                id="brand-name"
                name="brand-name"
                value={brandName}
                onChange={handleTextChange(setBrandName)}
                placeholder="e.g. Antifragility Labs"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="focus-audience" className="text-sm font-medium text-slate-700">
                Who should this piece resonate with?
              </label>
              <textarea
                id="focus-audience"
                name="focus-audience"
                value={focusAudience}
                onChange={handleTextChange(setFocusAudience)}
                placeholder="Describe the audience segment and what they care about."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="business-goal" className="text-sm font-medium text-slate-700">
                Primary business goal
              </label>
              <input
                id="business-goal"
                name="business-goal"
                value={businessGoal}
                onChange={handleTextChange(setBusinessGoal)}
                placeholder="e.g. Launch a thought-leadership newsletter"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="metric" className="text-sm font-medium text-slate-700">
                Key success metric
              </label>
              <input
                id="metric"
                name="metric"
                value={keyMetric}
                onChange={handleTextChange(setKeyMetric)}
                placeholder="e.g. Increase demo requests by 30%"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="data-source" className="text-sm font-medium text-slate-700">
                Preferred data source
              </label>
              <select
                id="data-source"
                name="data-source"
                value={dataSource}
                onChange={handleDataSourceChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="First-party analytics">First-party analytics</option>
                <option value="Industry benchmarks">Industry benchmarks</option>
                <option value="Customer research">Customer research</option>
                <option value="Public datasets">Public datasets</option>
              </select>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate suggested outline">
              Generate Suggested Outline
            </Button>
          </div>
        </form>

        <div className="flex min-h-[420px] flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <LineChart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Data-backed angle preview</p>
              <p className="text-xs text-slate-500">We will combine proprietary and public signals to recommend the optimal talking point.</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-[#1F2A6B]">Campaign focus</p>
              <p className="mt-1 text-xs text-slate-500">
                {brandName || "Your brand"} wants to help {filledAudience} to {filledGoal}. Success is measured by {filledMetric}.
              </p>
            </div>

            <div className="space-y-2 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Recommended signals</p>
              <ul className="space-y-1 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  Audience intent keyword clusters updated weekly
                </li>
                <li className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  {dataSource} blended with Bear's proprietary dataset
                </li>
                <li className="flex items-center gap-2">
                  <LineChart className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  Performance outlook with forecasted lift
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BlogpostShell>
  );
};

export default SuggestedCreatePage;
