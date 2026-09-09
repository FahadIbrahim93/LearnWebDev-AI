/**
 * Dashboard — the learner's home base. Shows lesson progress and a big
 * "continue" CTA into the lesson. Neobrutalism Minimalism styling.
 */
import { Link, useNavigate } from "react-router";
import { BookOpen, LogOut, Map, RotateCcw, Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NbBox, NbButton, NbRouterLink, NbSection, NbTag } from "@/components/nb";
import { cn } from "@/lib/utils";

const LESSON_ID = "webdev-ai-v1";
const STEP_TITLES = [
  "What is a website?",
  "What is it made of?",
  "Where does AI fit in?",
  "Build one yourself",
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const serverProgress = useQuery(api.progress.getLessonProgress, {
    lessonId: LESSON_ID,
  });

  const completedCount = serverProgress?.completedSteps?.length ?? 0;
  const done = completedCount >= 4;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-secondary">
        <NbSection className="flex items-center justify-between py-3">
          <Link to="/" className="nb-border bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">
            Webdev × AI
          </Link>
          <NbButton variant="ghost" onClick={handleSignOut} className="px-3 py-1.5">
            <LogOut className="size-4" /> Sign out
          </NbButton>
        </NbSection>
      </header>

      <NbSection className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <NbTag className="bg-accent">Learner dashboard</NbTag>
            <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Welcome{user?.name ? `, ${user.name}` : " back"}
            </h1>
          </div>
        </div>

        {/* Lesson progress card */}
        <NbBox className="nb-shadow-lg mt-8 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="nb-border flex size-10 items-center justify-center bg-accent">
                <BookOpen className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold uppercase">
                  Lesson 1 · Web development with AI
                </h2>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  4 steps · ~15 min · beginner
                </p>
              </div>
            </div>
            <NbRouterLink
              to="/lesson"
              variant={done ? "ghost" : "accent"}
            >
              {done ? (
                <>
                  <RotateCcw className="size-4" /> Replay
                </>
              ) : completedCount > 0 ? (
                "Continue lesson"
              ) : (
                "Start lesson"
              )}
            </NbRouterLink>
          </div>

          {/* Step checklist */}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {STEP_TITLES.map((t, i) => {
              const isDone = serverProgress?.completedSteps?.includes(i) ?? false;
              return (
                <div
                  key={t}
                  className={cn(
                    "nb-border flex items-center gap-2 px-3 py-2 text-sm font-medium",
                    isDone ? "bg-[var(--chart-2)]" : "bg-background",
                  )}
                >
                  <span className="font-mono text-xs font-bold">
                    {isDone ? "✓" : i + 1}
                  </span>
                  {t}
                </div>
              );
            })}
          </div>

          {done && (
            <div className="nb-border mt-6 flex items-center gap-2 bg-accent px-3 py-2">
              <Trophy className="size-4" />
              <p className="text-sm font-bold uppercase">
                Lesson 1 complete — certificate earned!
              </p>
            </div>
          )}
        </NbBox>

        {/* What's next */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <NbBox className="bg-secondary p-5">
            <Map className="size-5" />
            <h3 className="mt-2 text-base font-bold uppercase">Coming in v2</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              More lessons are being drafted: writing better prompts, adding
              images, and publishing your site to a real address.
            </p>
          </NbBox>
          <NbBox className="bg-secondary p-5">
            <Trophy className="size-5" />
            <h3 className="mt-2 text-base font-bold uppercase">Your goal</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Finish Lesson 1 to earn your certificate. Then build one more
              page for something you actually care about.
            </p>
          </NbBox>
        </div>
      </NbSection>
    </main>
  );
}
