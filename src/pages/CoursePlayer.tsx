/**
 * CoursePlayer — the actual learning experience for owned modules.
 * Guarded by auth + ownership (free modules are open to signed-in users).
 * Section-by-section with completion tracking in localStorage.
 */
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Circle,
  Lock,
  PenLine,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getContentFor } from "@/convex/moduleContent";
import { SiteHeader } from "@/components/SiteHeader";
import { NbBox, NbButton, NbRouterLink, NbSection, NbTag } from "@/components/nb";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function CoursePlayer() {
  const { slug = "" } = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const lesson = useQuery(api.catalog.getLesson, { slug });
  const owned = useQuery(api.catalog.hasAccess, { slug });

  const content = getContentFor(slug);

  const storageKey = `${user?._id ?? "anon"}.module.${slug}.done`;
  const [done, setDone] = useState<Set<number>>(() => {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set();
  });
  const [section, setSection] = useState(0);

  const markDone = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev).add(i);
      window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const sections = content?.sections ?? [];
  const total = sections.length;
  const finished = done.size >= total && total > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-20 text-center text-sm text-muted-foreground">
          Loading…
        </NbSection>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(`/learn/${slug}`)}`}
        replace
      />
    );
  }

  // Access guard: free modules are open; paid modules require ownership.
  if (lesson && !lesson.isFree && owned === false) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-20">
          <NbBox className="nb-shadow-lg mx-auto max-w-md bg-card p-8 text-center">
            <Lock className="mx-auto size-10" />
            <h1 className="mt-3 text-2xl font-bold uppercase">
              This module is locked
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You'll find it in your dashboard the moment it's yours. One-time
              payment, lifetime access.
            </p>
            <NbRouterLink
              to={`/catalog/${slug}`}
              variant="accent"
              className="mt-5"
            >
              View the module
            </NbRouterLink>
          </NbBox>
        </NbSection>
      </div>
    );
  }

  if (!content || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-20 text-center text-sm text-muted-foreground">
          Module not found.
        </NbSection>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-16">
          <NbBox className="nb-shadow-lg mx-auto max-w-xl bg-accent p-8 text-center">
            <BookOpenCheck className="mx-auto size-12" />
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight">
              Module complete!
            </h1>
            <p className="mt-3 text-sm leading-relaxed">
              You finished <strong>{lesson.title}</strong>. The real win isn't
              the checkmarks — it's that you did the activities. Keep the
              notes you made; they're the raw material for your site.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <NbRouterLink to="/catalog" variant="primary">
                Next module
              </NbRouterLink>
              <NbRouterLink to="/dashboard" variant="ghost">
                Dashboard
              </NbRouterLink>
            </div>
            <p className="mt-6 nb-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
              {lesson.title} · completed {new Date().toLocaleDateString()}
            </p>
          </NbBox>
        </NbSection>
      </div>
    );
  }

  const s = sections[section];
  const progress = Math.round((done.size / total) * 100);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <NbSection className="py-8">
        <Link
          to="/catalog"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← Catalog
        </Link>

        {/* Module header + progress */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <NbTag className="bg-accent">{lesson.level}</NbTag>
            <h1 className="mt-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              {lesson.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold">{progress}%</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {done.size} of {total} sections
            </p>
          </div>
        </div>
        <div className="nb-border mt-3 h-4 bg-card">
          <div
            className="h-full bg-[var(--chart-2)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Section list */}
          <nav aria-label="Sections" className="space-y-2">
            {sections.map((sec, i) => (
              <button
                key={sec.title}
                onClick={() => setSection(i)}
                className={cn(
                  "nb-border nb-press flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide",
                  i === section ? "bg-accent" : "bg-card",
                )}
              >
                {done.has(i) ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <Circle className="size-3.5 shrink-0 opacity-40" />
                )}
                <span className="leading-tight">{sec.title}</span>
              </button>
            ))}
          </nav>

          {/* Section content */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Section {section + 1} of {total}
            </p>
            <h2 className="mt-1 text-xl font-bold uppercase sm:text-2xl">
              {s.title}
            </h2>

            <NbBox className="mt-4 bg-card p-5">
              {s.reading.map((para, i) => (
                <p
                  key={i}
                  className={cn(
                    "leading-relaxed",
                    i > 0 && "mt-3",
                    i === 0 && "text-base font-medium",
                  )}
                >
                  {para}
                </p>
              ))}
            </NbBox>

            <NbBox className="mt-4 bg-[var(--chart-3)] p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <PenLine className="size-3.5" /> Your turn
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{s.activity}</p>
            </NbBox>

            <NbBox className="mt-4 bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Remember
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {s.recap}
              </p>
            </NbBox>

            {/* Section controls */}
            <div className="mt-6 flex items-center justify-between">
              <NbButton
                variant="ghost"
                onClick={() => setSection((i) => Math.max(0, i - 1))}
                disabled={section === 0}
              >
                <ArrowLeft className="size-4" /> Back
              </NbButton>
              {done.has(section) ? (
                <NbButton
                  onClick={() => setSection((i) => Math.min(total - 1, i + 1))}
                  disabled={section === total - 1}
                >
                  Next <ArrowRight className="size-4" />
                </NbButton>
              ) : (
                <NbButton variant="success" onClick={() => markDone(section)}>
                  <Check className="size-4" /> Mark section done
                </NbButton>
              )}
            </div>
          </div>
        </div>
      </NbSection>
    </div>
  );
}
