export function DemoMode() {
  const base = import.meta.env.BASE_URL;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-border bg-secondary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a className="font-bold uppercase tracking-wide" href={base}>
            Web Dev <span className="text-accent">×</span> AI
          </a>
          <nav aria-label="Main navigation" className="flex gap-2">
            <a className="nb-border nb-press bg-card px-3 py-2 text-xs font-bold uppercase" href={`${base}lesson`}>
              Free lesson
            </a>
            <a className="nb-border nb-press bg-accent px-3 py-2 text-xs font-bold uppercase text-accent-foreground" href={`${base}catalog`}>
              Explore courses
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6">
        <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Interactive course platform
            </p>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-tight tracking-tight sm:text-6xl">
              Build a website you&apos;re proud of.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Learn the judgment behind great websites while AI handles the
              typing. Plain-language lessons, interactive challenges, and real
              projects for people who do not call themselves developers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="nb-border nb-press nb-shadow-lg bg-accent px-5 py-3 font-bold uppercase text-accent-foreground"
                href={`${base}lesson`}
              >
                Start the free lesson →
              </a>
              <a
                className="nb-border nb-press bg-card px-5 py-3 font-bold uppercase"
                href={`${base}catalog`}
              >
                Browse the catalog
              </a>
            </div>
          </div>

          <div className="nb-border-4 bg-card p-4 nb-shadow-lg">
            <p className="font-mono text-xs font-bold uppercase tracking-widest">
              Your learning path
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["01", "Understand the web", "Browsers, files, and servers without the jargon."],
                ["02", "Design with intent", "Make choices that help real people take action."],
                ["03", "Build with AI", "Turn a clear brief into a working, polished site."],
              ].map(([number, title, body]) => (
                <div key={number} className="nb-border bg-secondary p-3">
                  <p className="font-mono text-xs text-muted-foreground">{number}</p>
                  <p className="mt-1 font-bold uppercase">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-t-2 border-border py-12">
          <h2 id="features-heading" className="text-2xl font-bold uppercase">Learn by doing</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Interactive lessons", "Poke, break, and fix small demos until the concept sticks."],
              ["18 hands-on challenges", "Practice prompts, layouts, launches, and content decisions."],
              ["A real finished project", "Leave with a useful website—not a certificate of attendance."],
            ].map(([title, body]) => (
              <article key={title} className="nb-border bg-card p-5">
                <h3 className="font-bold uppercase">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-border py-10">
          <div className="nb-border bg-secondary p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Public demo mode
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              This showcase is fully static while the production Convex
              backend is being connected. The live deployment will unlock
              accounts, saved progress, catalog data, bookings, showcase
              projects, and the waitlist once <code>VITE_CONVEX_URL</code> is
              configured.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
