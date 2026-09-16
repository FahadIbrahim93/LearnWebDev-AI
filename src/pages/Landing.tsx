/**
 * Landing — a practical course pitch, not a generic SaaS hero.
 *
 * THESIS: Make the visitor feel the product's mechanism immediately: clear
 * thinking becomes a real site, with AI doing the typing.
 * OWN-WORLD: Cream paper, ink-black rules, signal yellow, condensed display
 * type, and a hard-edged browser artifact.
 * STORY: See the promise, inspect the method, then start the free lesson.
 * FIRST VIEWPORT: Compact utility header, left-aligned headline and CTAs,
 * right-side browser preview, then a dark audience ticker.
 * FORM: Neobrutalist course poster fused with a browser workbench.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CircleDot,
  GitFork,
  Mail,
  MousePointerClick,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  NbBox,
  NbButton,
  NbRouterLink,
  NbSection,
} from "@/components/nb";
import { SiteHeader } from "@/components/SiteHeader";
import { timeAgo } from "@/lib/githubShape";

const PILLARS = [
  {
    icon: MousePointerClick,
    title: "Learn by doing",
    body: "Poke, break, and fix small demos until the concept sticks.",
    bg: "bg-accent",
  },
  {
    icon: Sparkles,
    title: "AI does the typing",
    body: "You bring the judgment. Your AI assistant handles the syntax.",
    bg: "bg-[var(--chart-3)]",
  },
  {
    icon: Rocket,
    title: "Finish with something real",
    body: "Every module ends with a useful piece of your own website.",
    bg: "bg-[var(--chart-4)]",
  },
];

const STEPS = [
  ["01", "Take the free lesson", "Understand the web in 15 interactive minutes."],
  ["02", "Pick your modules", "Learn exactly what your site needs, one decision at a time."],
  ["03", "Launch your thing", "Publish with confidence and share what you made."],
];

export default function Landing() {
  usePageTitle();
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const waitlistCount = useQuery(api.waitlist.countWaitlist, {});
  const showcase = useQuery(api.showcase.listApproved, {});
  const repo = useQuery(api.githubCache.repoSnapshot, {});
  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "done" | "error">("idle");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleJoin = async () => {
    setWaitlistError(null);
    try {
      await joinWaitlist({ email });
      setWaitlistState("done");
      setEmail("");
    } catch (error) {
      setWaitlistError(error instanceof Error ? error.message : "Could not join.");
      setWaitlistState("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="/" />

      <main>
        <NbSection className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h1 className="max-w-3xl text-5xl font-bold uppercase leading-[0.94] tracking-[-0.055em] sm:text-7xl">
              Build a{" "}
              <motion.span
                className="inline-block bg-accent px-2 pb-1"
                initial={{ rotate: -1.5 }}
                animate={{ rotate: [-1.5, 1, -1.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                professional
              </motion.span>{" "}
              website with AI.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Web Development with AI teaches non-technical people how to make
              smart website decisions while AI handles the typing. No degree.
              No jargon wall. Just clear lessons and a site you can share.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <NbRouterLink to="/lesson" className="nb-shadow-lg px-5 py-3 text-sm sm:text-base">
                Start the free lesson <ArrowRight className="size-4" />
              </NbRouterLink>
              <NbRouterLink to="/catalog" variant="ghost" className="px-5 py-3 text-sm sm:text-base">
                Browse all modules
              </NbRouterLink>
            </div>
            <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Lesson 1 is free · ~15 minutes · nothing to install
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          >
            <NbBox className="bg-card p-3 nb-shadow-lg" style={{ transform: "rotate(1deg)" }}>
              <div className="nb-border-4 overflow-hidden bg-background">
                <div className="flex items-center gap-2 border-b-2 border-border bg-secondary px-3 py-2">
                  <span className="size-3 rounded-full border-2 border-border bg-destructive/70" />
                  <span className="size-3 rounded-full border-2 border-border bg-[var(--chart-4)]" />
                  <span className="size-3 rounded-full border-2 border-border bg-[var(--chart-2)]" />
                  <span className="ml-2 flex-1 border-2 border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    your-first-site.com
                  </span>
                </div>
                <div className="nb-dots min-h-[260px] p-4 sm:min-h-[310px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-tight">Café North</span>
                    <span className="nb-border bg-card px-2 py-1 text-[10px] font-bold uppercase">Book a table</span>
                  </div>
                  <div className="mt-12 max-w-xs">
                    <p className="text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
                      Good coffee.<br />
                      <span className="bg-accent px-1">Good company.</span>
                    </p>
                    <p className="mt-3 max-w-[22rem] text-xs leading-relaxed text-muted-foreground">
                      A warm neighborhood café for slow mornings and long conversations.
                    </p>
                    <div className="mt-5 flex gap-2">
                      <span className="nb-border bg-primary px-3 py-2 text-[10px] font-bold uppercase text-primary-foreground">See the menu</span>
                      <span className="nb-border bg-card px-3 py-2 text-[10px] font-bold uppercase">Our story</span>
                    </div>
                  </div>
                  <div className="mt-7 grid grid-cols-3 gap-2">
                    {["Menu", "About", "Visit"].map((item) => (
                      <span key={item} className="nb-border bg-card px-2 py-2 text-center text-[10px] font-bold uppercase">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="px-1 pb-1 pt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                The kind of thing you&apos;ll build in lesson one
              </p>
            </NbBox>
          </motion.div>
        </NbSection>

        <div className="border-y-2 border-border bg-primary py-3 text-primary-foreground">
          <NbSection className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
            <span>Shop owners</span><span aria-hidden>✦</span>
            <span>Freelancers</span><span aria-hidden>✦</span>
            <span>Community groups</span><span aria-hidden>✦</span>
            <span>Job seekers</span><span aria-hidden>✦</span>
            <span>The permanently curious</span>
          </NbSection>
        </div>

        <NbSection className="py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="max-w-xl text-4xl font-bold uppercase leading-none tracking-[-0.04em] sm:text-5xl">
              Why this course works
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              You do not need to become a developer. You need to know what good looks like.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PILLARS.map((feature) => (
              <NbBox key={feature.title} as="article" className={`${feature.bg} p-5`} shadow="nb-shadow">
                <feature.icon className="size-7" aria-hidden />
                <h3 className="mt-8 text-xl font-bold uppercase leading-none">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed">{feature.body}</p>
              </NbBox>
            ))}
          </div>
        </NbSection>

        <NbSection className="pb-16 sm:pb-20">
          <NbBox className="bg-secondary p-6 sm:p-8" as="section">
            <h2 className="text-3xl font-bold uppercase tracking-[-0.04em] sm:text-4xl">From blank page to live link</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {STEPS.map(([number, title, body]) => (
                <div key={number} className="border-t-2 border-border pt-4">
                  <p className="font-mono text-2xl font-bold">{number}</p>
                  <h3 className="mt-2 text-sm font-bold uppercase">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </NbBox>
        </NbSection>

        {showcase && showcase.length > 0 && (
          <NbSection className="pb-16">
            <h2 className="text-3xl font-bold uppercase tracking-[-0.04em]">People like you already shipped</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {showcase.slice(0, 3).map((project) => (
                <NbBox key={project._id} as="article" className="flex flex-col bg-card p-5">
                  <p className="font-bold uppercase leading-tight">{project.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    by {project.authorName ?? "a student"}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {project.description.length > 140 ? `${project.description.slice(0, 140)}…` : project.description}
                  </p>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs font-bold uppercase tracking-widest underline">
                      Visit the site →
                    </a>
                  )}
                </NbBox>
              ))}
            </div>
          </NbSection>
        )}

        {repo && (
          <NbSection className="pb-16">
            <NbBox className="bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold uppercase">Built in the open</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    The same public code this course teaches: describe it, let AI type, review everything.
                  </p>
                </div>
                <a href={`https://github.com/${repo.repo}`} target="_blank" rel="noopener noreferrer" className="nb-border nb-press inline-flex items-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase text-primary-foreground">
                  View on GitHub <ArrowRight className="size-4" />
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 border-t-2 border-border pt-4 font-mono text-xs">
                <span className="flex items-center gap-1.5"><Star className="size-4" /> {repo.stars} stars</span>
                <span className="flex items-center gap-1.5"><GitFork className="size-4" /> {repo.forks} forks</span>
                <span className="flex items-center gap-1.5"><CircleDot className="size-4" /> {repo.openIssues} open issues</span>
                <span className="text-muted-foreground">pushed {timeAgo(repo.pushedAt)}</span>
              </div>
            </NbBox>
          </NbSection>
        )}

        <NbSection className="pb-20">
          <NbBox className="bg-accent p-7 text-center nb-shadow-lg sm:p-10">
            <h2 className="text-3xl font-bold uppercase leading-none tracking-[-0.04em] sm:text-5xl">
              Your site is closer than you think.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed">
              Start with the free lesson. When you&apos;re ready, choose the modules that fit your next step.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <NbRouterLink to="/lesson" className="px-5 py-3">Start the free lesson <ArrowRight className="size-4" /></NbRouterLink>
              <NbRouterLink to="/catalog" variant="ghost" className="px-5 py-3">Browse all modules</NbRouterLink>
            </div>
            <div className="mx-auto mt-8 max-w-md border-t-2 border-dashed border-border pt-6">
              {waitlistState === "done" ? (
                <p className="nb-border bg-background px-3 py-2.5 text-sm font-bold">You&apos;re on the list! We&apos;ll email you when new modules drop.</p>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest">Not ready yet? Get one useful web tip per email</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="nb-border min-w-0 flex-1 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
                      aria-label="Email address"
                    />
                    <NbButton onClick={handleJoin} disabled={!email.includes("@")} className="shrink-0">
                      <Mail className="size-4" /> Keep me posted
                    </NbButton>
                  </div>
                  {waitlistError && <p className="mt-2 text-sm text-destructive">{waitlistError}</p>}
                  {waitlistCount && waitlistCount.length > 5 && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {waitlistCount.length} people already on the list
                    </p>
                  )}
                </>
              )}
            </div>
          </NbBox>
        </NbSection>
      </main>

      <footer className="border-t-2 border-border py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Web Development with AI · Made for humans, typed by AI
        </p>
      </footer>
    </div>
  );
}
