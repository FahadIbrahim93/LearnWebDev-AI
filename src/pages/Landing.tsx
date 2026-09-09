/**
 * Landing — Web Development with AI. Neobrutalism Minimalism: square
 * corners, hard shadows, flat color blocks. One job: start the free lesson
 * or browse the catalog.
 */
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  ChefHat,
  MousePointerClick,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  NbBox,
  NbButton,
  NbRouterLink,
  NbSection,
  NbTag,
} from "@/components/nb";
import { SiteHeader } from "@/components/SiteHeader";

const PILLARS = [
  {
    icon: ChefHat,
    title: "Plain-language teaching",
    body: "No jargon walls. Browsers, servers, and files explained with everyday analogies you already understand.",
    bg: "bg-accent",
  },
  {
    icon: MousePointerClick,
    title: "Learn by clicking, not watching",
    body: "Every concept comes as a small interactive demo — poke it, break it, fix it. That's how it sticks.",
    bg: "bg-[var(--chart-3)]",
  },
  {
    icon: Sparkles,
    title: "AI does the typing",
    body: "You describe what you want; AI writes the code. You learn the judgment, not the syntax.",
    bg: "bg-[var(--chart-2)]",
  },
  {
    icon: Rocket,
    title: "Finish with something real",
    body: "Each module ends with a working piece of your own website — not a certificate of attendance.",
    bg: "bg-[var(--chart-4)]",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="/" />

      {/* Hero */}
      <NbSection className="py-14 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <NbTag className="bg-[var(--chart-5)]">
              For non-technical people · start free
            </NbTag>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl">
              Build your own{" "}
              <span className="nb-border inline-block bg-accent px-2">
                professional
              </span>{" "}
              website — with AI
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Web Development with AI teaches everyday people to create a
              site they're proud of. No computer-science degree, no
              memorizing code — just clear lessons, honest guidance, and AI
              as your typing assistant.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <NbRouterLink to="/lesson" className="nb-shadow-lg px-6 py-3 text-base">
                Start the free lesson <ArrowRight className="size-4" />
              </NbRouterLink>
              <NbRouterLink to="/catalog" variant="ghost" className="px-5 py-3 text-base">
                Browse all modules
              </NbRouterLink>
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Lesson 1 is free · ~15 minutes · nothing to install
            </p>
          </div>

          {/* Mini fake browser */}
          <NbBox className="nb-shadow-lg bg-card p-4">
            <div className="nb-border-4 bg-card">
              <div className="flex items-center gap-2 border-b-2 border-border bg-secondary px-3 py-2">
                <span className="nb-border block size-3 bg-destructive/70" />
                <span className="nb-border block size-3 bg-[var(--chart-4)]/80" />
                <span className="nb-border block size-3 bg-[var(--chart-2)]/80" />
                <div className="ml-1 flex-1 border-2 border-border bg-background px-2 py-0.5 font-mono text-[10px]">
                  your-first-site.com
                </div>
              </div>
              <div className="nb-dots space-y-2 p-3">
                <div className="nb-border bg-accent px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    ☕ Your business — open for visitors
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Menu", "About", "Book"].map((t) => (
                    <div key={t} className="nb-border bg-secondary px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="nb-border bg-background px-3 py-2 text-xs">
                  <span className="font-bold">🤖 Your AI assistant:</span>{" "}
                  "Describe the vibe — I'll handle the code. You stay the
                  boss."
                </div>
              </div>
            </div>
            <p className="mt-3 border-l-4 border-accent pl-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              You'll build this in the free lesson
            </p>
          </NbBox>
        </div>
      </NbSection>

      {/* Audience strip */}
      <div className="border-y-2 border-border bg-primary py-2.5">
        <NbSection className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
          <span>Shop owners</span>
          <span aria-hidden>✦</span>
          <span>Freelancers</span>
          <span aria-hidden>✦</span>
          <span>Community groups</span>
          <span aria-hidden>✦</span>
          <span>Job seekers</span>
          <span aria-hidden>✦</span>
          <span>The permanently curious</span>
        </NbSection>
      </div>

      {/* Pillars */}
      <NbSection className="py-14">
        <h2 className="text-3xl font-bold uppercase tracking-tight">
          Why this course works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((f) => (
            <NbBox key={f.title} className={f.bg + " p-5"}>
              <f.icon className="size-6" />
              <h3 className="mt-3 text-lg font-bold uppercase">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed">{f.body}</p>
            </NbBox>
          ))}
        </div>
      </NbSection>

      {/* How it works */}
      <NbSection className="pb-14">
        <NbBox className="bg-secondary p-6 sm:p-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            How it works
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Take the free lesson",
                b: "Fifteen interactive minutes. You'll understand what a website is and build a tiny one.",
              },
              {
                n: "02",
                t: "Pick your modules",
                b: "Search the catalog and buy only what you need. Everything is one-time payment, yours forever.",
              },
              {
                n: "03",
                t: "Launch & show off",
                b: "Publish your site, book a live session if you're stuck, and share your build in the showcase.",
              },
            ].map((s) => (
              <div key={s.n} className="nb-border bg-background p-4">
                <p className="font-mono text-2xl font-bold">{s.n}</p>
                <p className="mt-1 text-sm font-bold uppercase">{s.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.b}
                </p>
              </div>
            ))}
          </div>
        </NbBox>
      </NbSection>

      {/* Final CTA */}
      <NbSection className="pb-16">
        <NbBox className="nb-shadow-lg bg-accent p-8 text-center">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            The internet is waiting for your site
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed">
            Join the students who stopped saying "I wish I had a website" and
            started saying "here's the link."
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <NbRouterLink to="/lesson" className="px-6 py-3 text-base">
              Start free now <ArrowRight className="size-4" />
            </NbRouterLink>
            <NbRouterLink to="/catalog" variant="ghost" className="px-5 py-3 text-base">
              <CalendarClock className="size-4" /> See modules & book a session
            </NbRouterLink>
          </div>
        </NbBox>
      </NbSection>

      <footer className="border-t-2 border-border py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Web Development with AI · Made for humans, typed by AI
        </p>
      </footer>
    </div>
  );
}
