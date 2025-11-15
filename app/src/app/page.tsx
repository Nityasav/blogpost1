import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Bell, BookOpen, LayoutDashboard, Megaphone, Settings, Sparkles } from "lucide-react";
import { BlogGeneratorClient } from "@/components/blog-generator/blog-generator-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems: Array<{ id: string; label: string; icon: LucideIcon; active?: boolean }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "blogs", label: "Blogs", icon: BookOpen, active: true },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Sparkles },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const blogNavItems: Array<{ id: string; label: string; href: string; active?: boolean }> = [
  { id: "create", label: "Create", href: "/blogs/create", active: true },
  { id: "templates", label: "Templates", href: "/blogs/templates" },
];

const SuspenseFallback = () => (
  <div className="grid gap-4 rounded-3xl border border-[#2A33A4]/15 bg-white/85 p-10 shadow-[0_25px_65px_rgba(42,51,164,0.08)]">
    <div className="h-6 w-32 animate-pulse rounded-full bg-[#2A33A4]/10" />
    <div className="h-24 animate-pulse rounded-3xl bg-[#2A33A4]/10" />
  </div>
);

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFF]">
      <header className="mx-auto w-full max-w-[1920px] px-4 pt-6 lg:px-8">
        <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-4 shadow-[0_35px_90px_rgba(42,51,164,0.08)] backdrop-blur">
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
            asChild
            variant="ghost"
            className="rounded-full border border-transparent px-4 py-2 text-sm text-[#1F2A6B] hover:border-[#1F2A6B]/20"
          >
            <Link href="https://www.antifragilitylabs.com" target="_blank" rel="noreferrer">
              View company profile
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1920px] flex-1 px-4 pb-6 lg:px-8 lg:min-h-0">
        <div className="mt-8 grid gap-6 lg:grid-cols-[80px_minmax(0,1fr)] lg:min-h-0">
          <aside className="hidden lg:flex">
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
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </nav>
          </aside>

          <section className="flex min-h-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-start gap-4 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_35px_90px_rgba(42,51,164,0.08)] backdrop-blur">
              <div className="flex flex-wrap gap-2">
                {blogNavItems.map(({ id, label, href, active }) => (
                  <Button
                    key={id}
                    asChild
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm shadow-sm transition",
                      active
                        ? "bg-[#1F2A6B] text-white hover:bg-[#1F2A6B]/90"
                        : "border border-transparent text-[#1F2A6B]/80 hover:border-[#1F2A6B]/20 hover:text-[#1F2A6B]",
                    )}
                  >
                    <Link href={href} tabIndex={0}>
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-[36px] border border-[#1F2A6B]/10 bg-white/80 p-6 shadow-[0_45px_120px_rgba(42,51,164,0.12)] backdrop-blur">
              <Suspense fallback={<SuspenseFallback />}>
                <BlogGeneratorClient />
              </Suspense>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Home;
