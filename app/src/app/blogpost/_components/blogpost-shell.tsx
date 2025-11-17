import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";

type BlogpostShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
};

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "blogs", label: "Blogs", icon: BookOpen, active: true },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Sparkles },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export const BlogpostShell = ({ children, topBar }: BlogpostShellProps) => {
  const shouldRenderTopBar = Boolean(topBar);

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFF]">
      <header className="reveal mx-auto w-full max-w-[1920px] px-3 pt-4 lg:px-6">
        <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-3.5 shadow-[0_30px_80px_rgba(42,51,164,0.07)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Antifragility logo"
              width={48}
              height={48}
              priority
              className="rounded-2xl border border-[#2A33A4]/15 bg-white p-2 shadow-sm"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#6B7280]">Antifragility</p>
              <p className="text-lg font-semibold text-[#1F2A6B]">Modular Intelligence Platform</p>
            </div>
          </div>
          <Button
            href="https://www.antifragilitylabs.com"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            className="rounded-full border border-transparent px-4 py-2 text-sm text-[#1F2A6B] hover:border-[#1F2A6B]/20"
          >
            View company profile
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1920px] flex-1 px-3 pb-4 lg:px-6 lg:min-h-0">
        <div className="mt-6 grid gap-4 lg:grid-cols-[80px_minmax(0,1fr)] lg:min-h-0">
          <aside className="reveal-delay-1 hidden lg:flex">
            <nav
              aria-label="Primary navigation"
              className="flex h-full w-full flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/75 p-4 shadow-[0_30px_85px_rgba(42,51,164,0.08)] backdrop-blur"
            >
              {sidebarItems.map(({ id, icon: Icon, label, active }) => (
                <Link key={id} href="#" aria-label={label} className="w-full">
                  <span
                    tabIndex={0}
                    className={cn(
                      "flex w-full items-center justify-center rounded-2xl border border-transparent bg-white/40 p-3 text-[#1F2A6B]/70 transition hover:border-[#1F2A6B]/20 hover:text-[#1F2A6B]",
                      active ? "bg-[#1F2A6B] text-white shadow-lg shadow-[#1F2A6B]/30" : "",
                    )}
                  >
                    <Icon className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </nav>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col gap-4">
            {shouldRenderTopBar ? (
              <div className="reveal flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/85 p-3 shadow-[0_30px_80px_rgba(42,51,164,0.08)] backdrop-blur">
                {topBar}
              </div>
            ) : null}

            <div
              className={cn(
                "reveal-delay-2 flex-1 overflow-hidden rounded-[32px] bg-white/85 p-5 shadow-[0_40px_110px_rgba(42,51,164,0.12)] backdrop-blur",
                shouldRenderTopBar ? "" : "reveal",
              )}
            >
              {children}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};
