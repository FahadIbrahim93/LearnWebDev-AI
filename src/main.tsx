import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { RouteLoading, RouteSyncer } from "@/components/RouteSyncer";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Lesson = lazy(() => import("./pages/Lesson.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const CatalogItem = lazy(() => import("./pages/CatalogItem.tsx"));
const Book = lazy(() => import("./pages/Book.tsx"));
const CoursePlayer = lazy(() => import("./pages/CoursePlayer.tsx"));
const Showcase = lazy(() => import("./pages/Showcase.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Certificate = lazy(() => import("./pages/Certificate.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// The Vly preview toolbar (and its heavy snapdom screenshot dependency) is
// lazy so it never blocks the first parse of the app bundle — it pops in a
// moment later and behaves exactly the same.
const VlyToolbar = lazy(() =>
  import("../vly-toolbar-readonly.tsx").then((m) => ({
    default: m.VlyToolbar,
  })),
);

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DemoMode() {
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

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <Suspense fallback={null}>
          <VlyToolbar />
        </Suspense>
      </ToolbarErrorBoundary>
      {convex ? (
        <ConvexAuthProvider client={convex}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <RouteSyncer />
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/auth"
                  element={<AuthPage redirectAfterAuth="/dashboard" />}
                />
                <Route path="/lesson" element={<Lesson />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:slug" element={<CatalogItem />} />
                <Route path="/book/:slug" element={<Book />} />
                <Route path="/learn/:slug" element={<CoursePlayer />} />
                <Route path="/showcase" element={<Showcase />} />
                <Route path="/certificate" element={<Certificate />} />
                <Route path="/certificate/:name" element={<Certificate />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <Admin />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </ConvexAuthProvider>
      ) : (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="*" element={<DemoMode />} />
          </Routes>
        </BrowserRouter>
      )}
    </RootErrorBoundary>
  </StrictMode>,
);
