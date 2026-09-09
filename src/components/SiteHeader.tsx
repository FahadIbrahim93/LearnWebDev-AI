/**
 * SiteHeader — shared navigation for every page. Rebrand: Web Development
 * with AI. Includes the dark developer-facing mode toggle.
 */
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { NbButton, NbSection } from "./nb";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/catalog", label: "Catalog" },
  { to: "/showcase", label: "Showcase" },
  { to: "/lesson", label: "Free lesson" },
  { to: "/dashboard", label: "Dashboard" },
];

export function SiteHeader({ active }: { active?: string }) {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(
    () => window.localStorage.getItem("nb-theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("nb-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-secondary/95 backdrop-blur">
      <NbSection className="flex items-center justify-between py-2.5">
        <Link
          to="/"
          className="nb-border nb-press bg-primary px-2 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground"
        >
          Web Dev <span className="text-accent dark:text-background">×</span> AI
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "nb-border nb-press px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest",
                active === item.to
                  ? "bg-accent text-accent-foreground"
                  : "bg-card",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="nb-border nb-press bg-card p-1.5"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {isAuthenticated ? (
            <NbButton variant="ghost" onClick={handleSignOut} className="px-2.5 py-1.5 text-[11px]">
              Sign out
            </NbButton>
          ) : (
            <Link
              to="/auth?returnTo=%2Fcatalog"
              className="nb-border nb-press bg-accent px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      </NbSection>
    </header>
  );
}
