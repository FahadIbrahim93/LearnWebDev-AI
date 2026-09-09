/**
 * CoursePlayer — the actual learning experience for owned modules.
 * Guarded by auth + ownership (free modules are open to signed-in users).
 * Section-by-section; each section ends in a hands-on interactive challenge
 * that must be solved before the section can be marked done. Completion
 * (done + solved) persists in localStorage per user.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Circle,
  Lock,
  PenLine,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getContentFor } from "@/convex/moduleContent";
import { SiteHeader } from "@/components/SiteHeader";
import { NbBox, NbRouterLink, NbSection, NbTag } from "@/components/nb";
import { NbConfetti } from "@/components/interactive/NbConfetti";
import { SectionActivity } from "@/components/interactive/SectionActivity";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";

function readIdSet(key: string): Set<number> {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, set: Set<number>) {
  window.localStorage.setItem(key, JSON.stringify([...set]));
}

export default function CoursePlayer() {
  const { slug = "" } = useParams();
  usePageTitle("Course");
  const { isAuthenticated, isLoading, user } = useAuth();
  const lesson = useQuery(api.catalog.getLesson, { slug });
  const owned = useQuery(api.catalog.hasAccess, { slug });
  const serverProgress = useQuery(api.moduleProgress.getModuleProgress, {
    moduleSlug: slug,
  });
  const saveProgress = useMutation(api.moduleProgress.saveModuleProgress);

  const content = getContentFor(slug);
  const uid = user?._id ?? "anon";

  // `done` = sections marked complete; `solved` = challenges beaten.
  // Keyed per user; reload when the signed-in user resolves.
  const doneKey = `${uid}.module.${slug}.done`;
  const solvedKey = `${uid}.module.${slug}.solved`;
  const [done, setDone] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Back-compat: learners who finished sections before challenges existed
    // keep their checkmarks (a pre-solved section counts as solved too —
    // replaying is always allowed).
    const prevDone = readIdSet(doneKey);
    const prevSolved = readIdSet(solvedKey);
    const mergedSolved = new Set(prevSolved);
    for (const i of prevDone) mergedSolved.add(i);
    setDone(prevDone);
    setSolved(mergedSolved);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, solvedKey]);

  // Server hydration (signed-in only): union with local so switching devices
  // adds progress instead of losing it. Runs once per user+module.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated || !serverProgress) return;
    setDone((prev) => {
      const next = new Set(prev);
      for (const s of serverProgress.doneSections) next.add(s);
      return next;
    });
    setSolved((prev) => {
      const next = new Set(prev);
      for (const s of serverProgress.solvedSections) next.add(s);
      return next;
    });
    setHydrated(true);
  }, [serverProgress, hydrated]);

  // Save-through: whenever local progress changes (and we're signed in with
  // hydration settled), push the union up. Merge-safe on the server too.
  const savePayload = useMemo(
    () => ({ moduleSlug: slug, doneSections: [...done], solvedSections: [...solved] }),
    [slug, done, solved],
  );
  useEffect(() => {
    if (!hydrated || !user) return;
    void saveProgress(savePayload);
  }, [savePayload, hydrated, user, saveProgress]);

  const [section, setSection] = useState(0);
  const [gateShake, setGateShake] = useState(0);
  const [finishBurst, setFinishBurst] = useState(0);

  // Jump back to the top when the section changes so the new section title
  // is what you see, not the middle of the previous one.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [section]);

  const markDone = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev).add(i);
      writeIdSet(doneKey, next);
      return next;
    });
  };

  const markSolved = (i: number) => {
    setSolved((prev) => {
      const next = new Set(prev).add(i);
      writeIdSet(solvedKey, next);
      return next;
    });
  };

  const sections = content?.sections ?? [];
  const total = sections.length;
  const finished = total > 0 && done.size >= total;
  const progress = total > 0 ? Math.round((done.size / total) * 100) : 0;

  // Fire the completion confetti once when the module is finished.
  useEffect(() => {
    if (finished) setFinishBurst((k) => (k === 0 ? 1 : k));
  }, [finished]);

  if (isLoading || !loaded) {
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

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-20 text-center text-sm text-muted-foreground">
          Module not found.
        </NbSection>
      </div>
    );
  }

  if (!content) {
    // Authored in the catalog but no course content yet — be honest and
    // route the learner somewhere useful instead of showing an empty player.
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="py-20">
          <NbBox className="nb-shadow-lg mx-auto max-w-md bg-card p-8 text-center">
            <BookOpenCheck className="mx-auto size-10" />
            <h1 className="mt-3 text-2xl font-bold uppercase">
              Coming soon
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <strong>{lesson.title}</strong> is being written right now. Your
              access is safe — it will appear in your dashboard the moment it
              launches.
            </p>
            <NbRouterLink to="/dashboard" variant="accent" className="mt-5">
              Back to dashboard
            </NbRouterLink>
          </NbBox>
        </NbSection>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <NbSection className="relative py-16">
          <NbConfetti burstKey={finishBurst} />
          <NbBox className="nb-shadow-lg relative mx-auto max-w-xl bg-accent p-8 text-center">
            <span className="nb-border nb-stamp mx-auto mt-1 inline-block bg-background px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-widest">
              Completed
            </span>
            <BookOpenCheck className="mx-auto mt-5 size-12" />
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight">
              Module complete!
            </h1>
            <p className="mt-3 text-sm leading-relaxed">
              You finished <strong>{lesson.title}</strong> — every section read,
              every challenge solved. The real win isn't the checkmarks; it's
              that you did the activities. Keep the notes you made; they're the
              raw material for your site.
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
  const sectionSolved = solved.has(section);
  const sectionDone = done.has(section);

  const handleMarkDone = () => {
    if (!sectionSolved) {
      // Nudge: shake the challenge card so the eye goes where the work is.
      setGateShake((k) => k + 1);
      return;
    }
    markDone(section);
  };

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
            className="h-full bg-[var(--chart-2)] transition-all duration-500"
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
                ) : solved.has(i) ? (
                  <Sparkles className="size-3.5 shrink-0 text-[var(--chart-1)]" />
                ) : (
                  <Circle className="size-3.5 shrink-0 opacity-40" />
                )}
                <span className="leading-tight">{sec.title}</span>
              </button>
            ))}
          </nav>

          {/* Section content with slide transitions */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
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

              {/* The interactive challenge — gates section completion */}
              <NbBox
                as="div"
                key={gateShake}
                className={cn(
                  "mt-4 bg-secondary p-4",
                  gateShake > 0 && !sectionSolved && "nb-shake",
                )}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Challenge · solve to check this section off
                </p>
                <SectionActivity
                  slug={slug}
                  sectionIndex={section}
                  interactive={s.interactive}
                  solvedAtMount={sectionSolved}
                  onSolved={() => markSolved(section)}
                />
              </NbBox>

              {!sectionDone && !sectionSolved && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Solve the challenge above to unlock "mark section done."
                </p>
              )}

              {/* Section controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setSection((i) => Math.max(0, i - 1))}
                  disabled={section === 0}
                  className="nb-border nb-press inline-flex items-center gap-2 bg-background px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
                {sectionDone ? (
                  <button
                    onClick={() =>
                      setSection((i) => Math.min(total - 1, i + 1))
                    }
                    disabled={section === total - 1}
                    className="nb-border nb-shadow-sm nb-press inline-flex items-center gap-2 bg-[var(--chart-2)] px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    Next <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleMarkDone}
                    className={cn(
                      "nb-border nb-shadow-sm nb-press inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide",
                      sectionSolved
                        ? "bg-accent"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Check className="size-4" />
                    {sectionSolved ? "Mark section done" : "Solve to mark done"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </NbSection>
    </div>
  );
}
