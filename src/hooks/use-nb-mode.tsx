/**
 * Theme hook for the lesson's signature interaction: AI vs Human comparison.
 * "ai" mode = digital teal/lime futuristic flat colors.
 * "human" mode = warm amber/cream flat colors.
 */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NbMode = "ai" | "human";

const NbModeContext = createContext<NbMode>("human");

export function NbModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NbMode>("human");
  const value = useMemo(() => mode, [mode]);
  return (
    <NbModeContext.Provider value={value}>{children}</NbModeContext.Provider>
  );
}

export function useNbMode() {
  const mode = useContext(NbModeContext);
  return {
    mode,
    isAi: mode === "ai",
    isHuman: mode === "human",
  };
}

/** A visible toggle rendered as a neobrutalist segmented switch. */
export function NbModeToggle({
  value,
  onChange,
  className,
}: {
  value: NbMode;
  onChange: (m: NbMode) => void;
  className?: string;
}) {
  return (
    <div
      className={
        "nb-border inline-flex bg-card " +
        (className ?? "")
      }
      role="group"
      aria-label="Compare AI vs Human"
    >
      <button
        onClick={() => onChange("human")}
        aria-pressed={value === "human"}
        className={
          "px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors " +
          (value === "human"
            ? "bg-accent text-accent-foreground"
            : "bg-card text-muted-foreground")
        }
      >
        👤 Human way
      </button>
      <span className="w-0.5 bg-border" aria-hidden />
      <button
        onClick={() => onChange("ai")}
        aria-pressed={value === "ai"}
        className={
          "px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors " +
          (value === "ai"
            ? "bg-[var(--chart-3)] text-foreground"
            : "bg-card text-muted-foreground")
        }
      >
        🤖 With AI
      </button>
    </div>
  );
}
