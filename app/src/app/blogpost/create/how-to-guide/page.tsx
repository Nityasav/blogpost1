"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ClipboardList, Timer, Workflow } from "lucide-react";
import { BlogpostShell } from "../../_components/blogpost-shell";
import { Button } from "@/components/ui/neon-button";

const HowToGuideCreatePage = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [estimatedTime, setEstimatedTime] = useState("30 minutes");
  const [prerequisites, setPrerequisites] = useState("");
  const [stepOverview, setStepOverview] = useState("Step 1: \\nStep 2: \\nStep 3: ");
  const [proTips, setProTips] = useState("");

  const handleInput = useCallback((setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(event.target.value);
  }, []);

  const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSkillLevel(event.target.value);
  }, []);

  const handleTimeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setEstimatedTime(event.target.value);
  }, []);

  const handleGenerate = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const topBar = useMemo(
    () => (
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-[#1F2A6B]">How-To Guide Template</h1>
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
            <p className="text-sm font-medium text-slate-700">Guide Configuration</p>
            <p className="text-xs text-slate-400">Outline the process so we can craft step-by-step instructions with helpful context.</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2A6B]">
                  <Workflow className="h-4 w-4" aria-hidden="true" />
                  How-To Guide
                </span>
                <span className="text-xs text-[#1F2A6B]/70">Step-by-step instructions to accomplish a specific task</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label htmlFor="task-title" className="text-sm font-medium text-slate-700">
                Task title
              </label>
              <input
                id="task-title"
                name="task-title"
                value={taskTitle}
                onChange={handleInput(setTaskTitle)}
                placeholder="e.g. Launch an automated onboarding email series"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="skill-level" className="text-sm font-medium text-slate-700">
                Skill level
              </label>
              <select
                id="skill-level"
                name="skill-level"
                value={skillLevel}
                onChange={handleSelectChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="grid gap-3">
              <label htmlFor="estimated-time" className="text-sm font-medium text-slate-700">
                Estimated time to complete
              </label>
              <select
                id="estimated-time"
                name="estimated-time"
                value={estimatedTime}
                onChange={handleTimeChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="Multi-day project">Multi-day project</option>
              </select>
            </div>

            <div className="grid gap-3">
              <label htmlFor="prerequisites" className="text-sm font-medium text-slate-700">
                Prerequisites & resources
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                value={prerequisites}
                onChange={handleInput(setPrerequisites)}
                placeholder="List required tools, access, and information."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="step-overview" className="text-sm font-medium text-slate-700">
                Step-by-step overview
              </label>
              <textarea
                id="step-overview"
                name="step-overview"
                value={stepOverview}
                onChange={handleInput(setStepOverview)}
                placeholder="Outline the major actions or phases."
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="pro-tips" className="text-sm font-medium text-slate-700">
                Pro tips & cautions
              </label>
              <textarea
                id="pro-tips"
                name="pro-tips"
                value={proTips}
                onChange={handleInput(setProTips)}
                placeholder="Share best practices, watch-outs, or expert insights."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button type="submit" className="w-full justify-center px-5 py-2.5 text-sm font-semibold" aria-label="Generate how-to guide outline">
              Generate Guide Outline
            </Button>
          </div>
        </form>

        <div className="flex min-h-[420px] flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Guide preview</p>
              <p className="text-xs text-slate-500">We turn your structure into a clear walkthrough ready for editing.</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            <div className="space-y-2">
              <p className="font-semibold text-[#1F2A6B]">{taskTitle || "Name your workflow"}</p>
              <p className="text-xs text-slate-500">
                Skill level: {skillLevel} • Estimated time: {estimatedTime}
              </p>
              {prerequisites ? (
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#1F2A6B]">Prerequisites</p>
                  <p className="mt-1 whitespace-pre-line">{prerequisites}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Workflow</p>
              <div className="space-y-2 text-xs text-slate-500">
                <p className="rounded-2xl border border-slate-200/70 bg-white/90 p-3 whitespace-pre-line">{stepOverview}</p>
                {proTips ? (
                  <p className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3 text-blue-700 whitespace-pre-line">
                    <Timer className="mr-2 inline h-3.5 w-3.5" aria-hidden="true" />
                    {proTips}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlogpostShell>
  );
};

export default HowToGuideCreatePage;
