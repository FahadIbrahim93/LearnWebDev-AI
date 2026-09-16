export function DemoMode() {
  const base = import.meta.env.BASE_URL;

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Web Development × AI
        </p>
        <h1 className="mt-4 text-4xl font-bold uppercase tracking-tight sm:text-6xl">
          Build a website you&apos;re proud of.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          The static demo is live. Connect a Convex deployment to enable
          accounts, saved progress, the catalog, bookings, and the waitlist.
        </p>
        <a
          className="nb-border nb-press mt-8 inline-block bg-accent px-5 py-3 font-bold uppercase tracking-wide text-accent-foreground"
          href={`${base}lesson`}
        >
          Open the free lesson
        </a>
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          Demo mode is active because VITE_CONVEX_URL is not configured.
        </p>
      </div>
    </main>
  );
}
