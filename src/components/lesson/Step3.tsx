/**
 * Step 3 — Where does AI fit in?
 * Two panels: "The Human Way" vs "The AI Way" of building the same café
 * site, plus a mini simulation of typing a prompt and watching files appear.
 */
import { useState } from "react";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import {
  NbBox,
  NbButton,
  NbDisclosure,
  NbQuiz,
  NbSection,
  NbTag,
} from "@/components/nb";
import {
  NbModeToggle,
  type NbMode,
} from "@/hooks/use-nb-mode";
import { cn } from "@/lib/utils";

const HUMAN_STEPS = [
  "Learn HTML, CSS & JavaScript (months)",
  "Write every file by hand, line by line",
  "Test in the browser, fix bugs, repeat",
  "Ship after weeks of practice",
];

const AI_STEPS = [
  "Describe what you want in plain words",
  "AI writes the files in seconds",
  "You look, react, and refine — like giving feedback",
  "Ship in an afternoon",
];

export function Step3({
  onNext,
  onSolved,
}: {
  onNext: () => void;
  onSolved: () => void;
}) {
  const [mode, setMode] = useState<NbMode>("human");
  const isAi = mode === "ai";
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "done">("idle");

  const simulate = () => {
    setPhase("thinking");
    // Simulate AI "thinking" then presenting files — no real backend needed.
    setTimeout(() => setPhase("done"), 1600);
  };

  return (
    <NbSection className="py-8">
      <div className="flex flex-wrap items-center gap-2">
        <NbTag>Step 3 of 4</NbTag>
        <NbTag className="bg-[var(--chart-5)]">Meet your new teammate</NbTag>
      </div>

      <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight">
        Where does AI fit in?
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Same café site. Same ingredients. The difference is <em>who does the
        typing</em>. Flip the switch and feel the difference.
      </p>

      <div className="mt-4">
        <NbModeToggle value={mode} onChange={setMode} />
      </div>

      {/* Comparison panels */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <NbBox className={cn("p-4", !isAi && "nb-shadow-lg bg-accent")}>
          <p className="text-sm font-bold uppercase tracking-widest">👤 The human way</p>
          <ul className="mt-3 space-y-2">
            {HUMAN_STEPS.map((s, i) => (
              <li key={s} className="nb-border bg-background px-2 py-1.5 text-sm">
                <span className="mr-1 font-mono font-bold">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Slower, but you understand every screw and bolt.
          </p>
        </NbBox>

        <NbBox className={cn("p-4", isAi && "nb-shadow-lg bg-[var(--chart-3)]")}>
          <p className="text-sm font-bold uppercase tracking-widest">🤖 The AI way</p>
          <ul className="mt-3 space-y-2">
            {AI_STEPS.map((s, i) => (
              <li key={s} className="nb-border bg-background px-2 py-1.5 text-sm">
                <span className="mr-1 font-mono font-bold">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Faster, but you still steer — AI is the engine, you are the driver.
          </p>
        </NbBox>
      </div>

      {/* Prompt simulation */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Wand2 className="size-5" />
          <h3 className="text-xl font-bold uppercase tracking-tight">
            Try the feeling of prompting
          </h3>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This is a pretend AI — nothing is sent anywhere. Type a wish and see
          what \"it\" does.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <NbBox className="bg-card p-4">
            <label htmlFor="prompt-input" className="text-xs font-bold uppercase tracking-widest">
              Your wish
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="prompt-input"
                className="nb-border w-full bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-[var(--chart-3)]"
                placeholder="e.g. a bakery site with a pink menu"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <NbButton
                onClick={simulate}
                disabled={prompt.trim().length < 3 || phase === "thinking"}
                className="shrink-0"
              >
                <Sparkles className="size-4" />
                {phase === "thinking" ? "Thinking..." : "Make it"}
              </NbButton>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "a gym landing page",
                "a dog grooming site",
                "a barber shop menu",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="nb-border nb-press bg-secondary px-2 py-1 text-xs font-bold"
                >
                  {s}
                </button>
              ))}
            </div>
          </NbBox>

          <NbBox className="bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest">
              The AI&apos;s workbench
            </p>
            {phase === "idle" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Waiting for your wish…
              </p>
            )}
            {phase === "thinking" && (
              <div className="mt-3 space-y-2 font-mono text-xs">
                <p>→ reading your wish…</p>
                <p>→ picking colors…</p>
                <p>→ writing index.html…<span className="nb-caret" /></p>
              </div>
            )}
            {phase === "done" && (
              <div className="mt-3">
                <p className="nb-border bg-[var(--chart-2)] px-2 py-1.5 text-sm font-bold">
                  Done! 3 files created:
                </p>
                <div className="mt-2 space-y-1.5 font-mono text-xs">
                  <p className="nb-border bg-background px-2 py-1">📄 index.html — the skeleton</p>
                  <p className="nb-border bg-background px-2 py-1">🎨 styles.css — the outfit</p>
                  <p className="nb-border bg-background px-2 py-1">⚡ app.js — the muscles</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Notice: AI didn&apos;t replace the ingredients — it just typed them for you.
                </p>
              </div>
            )}
          </NbBox>
        </div>
      </div>

      <div className="mt-8">
        <NbQuiz
          question="Quick check: when you build with AI, whose job is the vision and taste?"
          options={[
            { label: "The AI decides everything" },
            { label: "Yours — AI is the engine, you are the driver", correct: true },
            { label: "Nobody's — it's automatic" },
          ]}
          onSolved={onSolved}
        />
      </div>

      <div className="mt-6">
        <NbDisclosure title="Is using AI 'cheating'?">
          No more than using a calculator is cheating at math. Professionals
          still learn the fundamentals — that's why this lesson teaches you
          what a website even is. AI amplifies people who understand the basics.
        </NbDisclosure>
      </div>

      <div className="mt-8 flex justify-end">
        <NbButton onClick={onNext}>
          Final step <ArrowRight className="size-4" />
        </NbButton>
      </div>
    </NbSection>
  );
}
