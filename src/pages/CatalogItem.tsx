/**
 * CatalogItem — the detail page for one course module. Shows the full
 * description, topics, price, and the actions: start learning (free), buy,
 * or book a live session.
 */
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { BookOpenCheck, CalendarClock, Check, ShoppingCart } from "lucide-react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { NbBox, NbButton, NbRouterLink, NbSection, NbTag } from "@/components/nb";
import { useAuth } from "@/hooks/use-auth";

export default function CatalogItem() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const lesson = useQuery(api.catalog.getLesson, { slug });
  const owned = useQuery(api.catalog.hasAccess, { slug });
  const startCheckout = useMutation(api.catalog.startCheckout);
  const startCheckoutAction = useAction(api.stripe.startCheckoutAction);
  const completeDemo = useMutation(api.catalog.completeDemoCheckout);
  const cancelOrder = useMutation(api.catalog.cancelOrder);

  const [checkoutState, setCheckoutState] = useState<
    "idle" | "pending" | "paid" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/catalog/${slug}`)}`);
      return;
    }
    setError(null);
    try {
      const res = await startCheckout({ slug });
      if (res.alreadyOwned) {
        setCheckoutState("paid");
        return;
      }
      if (!res.orderId) throw new Error("Could not start checkout.");
      setCheckoutState("pending");
      const session = await startCheckoutAction({
        slug,
        orderId: res.orderId,
        origin: window.location.origin,
      });
      if (session.mode === "stripe" && session.url) {
        // Real Stripe checkout — redirect to the hosted payment page.
        window.location.assign(session.url);
        return;
      }
      // Demo mode (no Stripe keys yet): simulate payment locally.
      await completeDemo({ orderId: res.orderId });
      setCheckoutState("paid");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setCheckoutState("error");
    }
  };

  const handleCancel = async () => {
    // Demo mode: just reset the UI state.
    setCheckoutState("idle");
  };
  void cancelOrder;

  const price = lesson
    ? lesson.isFree
      ? "Free"
      : `$${(lesson.priceCents / 100).toFixed(0)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="/catalog" />
      <NbSection className="py-10">
        <Link
          to="/catalog"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← Back to catalog
        </Link>

        {!lesson ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Main column */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <NbTag className="bg-accent">{lesson.level}</NbTag>
                <NbTag>{lesson.minutes} minutes</NbTag>
                <NbTag>{lesson.isFree ? "Free" : price}</NbTag>
              </div>
              <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">{lesson.tagline}</p>

              <NbBox className="mt-6 bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  About this module
                </p>
                <p className="mt-2 leading-relaxed">{lesson.description}</p>
              </NbBox>

              <h2 className="mt-8 text-xl font-bold uppercase tracking-tight">
                What you'll cover
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {lesson.topics.map((t) => (
                  <div
                    key={t}
                    className="nb-border flex items-center gap-2 bg-card px-3 py-2 text-sm"
                  >
                    <Check className="size-4 shrink-0 text-[var(--chart-2)]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Buy card */}
            <div>
              <NbBox className="nb-shadow-lg sticky top-20 bg-card p-5">
                <p className="font-mono text-3xl font-bold">{price}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  One-time payment · yours forever
                </p>

                {owned || checkoutState === "paid" ? (
                  <NbRouterLink
                    to={`/learn/${lesson.slug}`}
                    variant="success"
                    className="mt-4 w-full"
                  >
                    <BookOpenCheck className="size-4" /> Start the course
                  </NbRouterLink>
                ) : lesson.isFree ? (
                  <NbRouterLink
                    to={`/learn/${lesson.slug}`}
                    variant="accent"
                    className="mt-4 w-full"
                  >
                    Start learning now
                  </NbRouterLink>
                ) : checkoutState === "pending" ? (
                  <NbButton className="mt-4 w-full" disabled>
                    Processing payment…
                  </NbButton>
                ) : (
                  <NbButton className="mt-4 w-full" onClick={handleBuy}>
                    <ShoppingCart className="size-4" /> Buy this module
                  </NbButton>
                )}

                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}

                <div className="my-4 border-t-2 border-dashed border-border" />
                <div className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Prefer a live session?</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Book a 1-on-1 walkthrough of this module with your
                      instructor.
                    </p>
                    <Link
                      to={`/book/${lesson.slug}`}
                      className="mt-1.5 inline-block text-xs font-bold uppercase tracking-widest underline"
                    >
                      Pick a time →
                    </Link>
                  </div>
                </div>

                <p className="mt-4 nb-border bg-secondary px-2 py-1.5 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
                  Demo checkout active — no card is charged. Real card payments
                  via Stripe arrive with your Stripe keys.
                </p>
              </NbBox>
            </div>
          </div>
        )}
      </NbSection>
    </div>
  );
}
