/**
 * Landing — Neobrutalism Minimalism. Bold black type on flat cream, hard
 * shadows, accent color blocks. One job: get the learner into the lesson.
 */
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChefHat,
  MousePointerClick,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  NbBox,
  NbButton,
  NbRouterLink,
  NbSection,
  NbTag,
} from "@/components/nb";

const FEATURES = [
  {
    icon: ChefHat,
    title: "The café analogy",
    body: "Browser, server, files — explained with a coffee order, not jargon.",
    bg: "bg-accent",
  },
  {
    icon: MousePointerClick,
    title: "Anatomy, clickable",
    body: "Poke a real-looking page and see the skeleton, outfit, and muscles.",
    bg: "bg-[var(--chart-3)]",
  },
  {
    icon: Sparkles,
    title: "Feel AI build",
    body: "Type a wish, watch files appear, then steer it with better feedback.",
    bg: "bg-[var(--chart-2)]",
  },
  {
    icon: Wrench,
    title: "Build one yourself",
    body: "Generate your own café site — vibe, color, and words are yours.",
    bg: "bg-[var(--chart-4)]",
  },
];

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="border-b-2 border-border bg-secondary">
        <NbSection className="flex items-center justify-between py-3">
          <span className="nb-border bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">
            Webdev × AI
          </span>
          <div className="flex items-center gap-2">
            <NbRouterLink to="/dashboard" variant="ghost">
              Dashboard
            </NbRouterLink>
            <NbRouterLink to="/lesson" variant="accent">
              Start lesson
            </NbRouterLink>
          </div>
        </NbSection>
      </header>

      {/* Hero */}
      <NbSection className="py-14 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <NbTag className="bg-[var(--chart-5)]">Lesson 1 · for absolute beginners</NbTag>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl">
              Web development,{" "}
              <span className="nb-border inline-block bg-accent px-2">
                explained
              </span>{" "}
              like a coffee order
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              An interactive first lesson for non-technical people. No code to
              install, no jargon wall — just a café, a browser, and a friendly
              AI teammate.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <NbRouterLink to="/lesson" className="nb-shadow-lg px-6 py-3 text-base">
                Start the free lesson <ArrowRight className="size-4" />
              </NbRouterLink>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                ~15 minutes · 4 steps · 1 build
              </span>
            </div>
          </div>

          {/* Mini fake browser */}
          <NbBox className="nb-shadow-lg bg-card p-4">
            <div className="nb-border-4 bg-card">
              <div className="flex items-center gap-2 border-b-2 border-border bg-secondary px-3 py-2">
                <span className="nb-border block size-3 bg-destructive/70" />
                <span className="nb-border block size-3 bg-[var(--chart-4)]/80" />
                <span className="nb-border block size-3 bg-[var(--chart-2)]/80" />
                <div className="ml-1 flex-1 border-2 border-border bg-background px-2 py-0.5 font-mono text-[10px]">
                  www.cornercafe.com
                </div>
              </div>
              <div className="nb-dots space-y-2 p-3">
                <div className="nb-border bg-accent px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    ☕ The Corner Café — best coffee in town
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Menu", "Find us", "About"].map((t) => (
                    <div key={t} className="nb-border bg-secondary px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="nb-border bg-background px-3 py-2 text-xs">
                  <span className="font-bold">🤖 AI teammate:</span> "Tell me
                  your café's vibe and I'll build the page — you stay the
                  boss."
                </div>
              </div>
            </div>
            <p className="mt-3 border-l-4 border-accent pl-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              You'll build this in step 4
            </p>
          </NbBox>
        </div>
      </NbSection>

      {/* Audience strip */}
      <div className="border-y-2 border-border bg-primary py-2.5">
        <NbSection className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
          <span>For students</span>
          <span aria-hidden>✦</span>
          <span>For founders</span>
          <span aria-hidden>✦</span>
          <span>For the curious</span>
          <span aria-hidden>✦</span>
          <span>No tech background needed</span>
        </NbSection>
      </div>

      {/* Features */}
      <NbSection className="py-14">
        <h2 className="text-3xl font-bold uppercase tracking-tight">
          What you'll do
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <NbBox key={f.title} className={f.bg + " p-5"}>
              <f.icon className="size-6" />
              <h3 className="mt-3 text-lg font-bold uppercase">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed">{f.body}</p>
            </NbBox>
          ))}
        </div>
      </NbSection>

      {/* Final CTA */}
      <NbSection className="pb-16">
        <NbBox className="nb-shadow-lg bg-secondary p-8 text-center">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Ready when you are
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            One short interactive demo, four steps, zero setup. Your progress
            is saved when you sign in.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <NbRouterLink to="/lesson" className="px-6 py-3 text-base">
              Start lesson now <ArrowRight className="size-4" />
            </NbRouterLink>
          </div>
        </NbBox>
      </NbSection>

      <footer className="border-t-2 border-border py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Webdev × AI · v1 · Built to teach, made to share
        </p>
      </footer>
    </motion.div>
  );
}
