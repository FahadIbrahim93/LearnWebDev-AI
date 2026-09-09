import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

/* ------------------------------------------------------------------ */
/* Public catalog queries                                              */
/* ------------------------------------------------------------------ */

export const listLessons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
  },
});

export const getLesson = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/* ------------------------------------------------------------------ */
/* Ownership helpers                                                   */
/* ------------------------------------------------------------------ */

export const listMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const hasAccess = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return false;
    const order = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return order.some((o) => o.lessonSlug === args.slug && o.status === "paid");
  },
});

/* ------------------------------------------------------------------ */
/* Checkout                                                            */
/* ------------------------------------------------------------------ */

/**
 * Creates a pending order. When Stripe keys are configured this returns a
 * hosted checkout URL; otherwise it returns a demo checkout (no money moves,
 * order is marked paid with provider "demo").
 */
export const startCheckout = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to purchase.");

    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!lesson || !lesson.isPublished) throw new Error("Lesson not found.");

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.some((o) => o.lessonSlug === args.slug && o.status === "paid")) {
      return { alreadyOwned: true as const, orderId: null as string | null, url: null as string | null };
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      lessonSlug: args.slug,
      amountCents: lesson.priceCents,
      status: "pending",
      createdAt: Date.now(),
    });

    return { alreadyOwned: false as const, orderId, url: null as string | null };
  },
});

export const completeDemoCheckout = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Order not found.");

    await ctx.db.patch(args.orderId, {
      status: "paid",
      provider: "demo",
    });

    // Receipt email — detached, no-op without RESEND_API_KEY.
    await ctx.scheduler.runAfter(0, internal.catalog.sendOrderReceipt, {
      orderId: args.orderId,
    });

    return args.orderId;
  },
});

/** Sends the receipt for a paid order (used after demo or Stripe payment). */
export const sendOrderReceipt = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status !== "paid") return;
    const user = await ctx.db.get(order.userId);
    const email = user?.email;
    if (!email) return;
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", order.lessonSlug))
      .unique();
    await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
      to: email,
      subject: `Your receipt — ${lesson?.title ?? order.lessonSlug}`,
      text: [
        `Hi${user?.name ? ` ${user.name}` : ""},`,
        ``,
        `Thanks for your purchase!`,
        ``,
        `Module: ${lesson?.title ?? order.lessonSlug}`,
        `Amount: $${(order.amountCents / 100).toFixed(2)} (${order.provider ?? "demo"})`,
        ``,
        `Your module is unlocked forever: <site>/learn/${order.lessonSlug}`,
        `Questions? Just reply to this email.`,
        ``,
        `— Web Development with AI`,
      ].join("\n"),
    });
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Order not found.");
    await ctx.db.patch(args.orderId, { status: "cancelled" });
  },
});

/** Fetch one of the caller's own orders (used by the checkout action). */
export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) return null;
    return order;
  },
});

/** Attach the Stripe session id to a pending order (used by the action). */
export const attachStripeSession = mutation({
  args: { orderId: v.id("orders"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Order not found.");
    await ctx.db.patch(args.orderId, { stripeSessionId: args.sessionId });
  },
});

/** Mark an order paid by id — called only from the Stripe webhook. */
export const markOrderPaidById = internalMutation({
  args: { orderId: v.id("orders"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status === "paid") return;
    await ctx.db.patch(args.orderId, {
      status: "paid",
      provider: "stripe",
      stripeSessionId: args.sessionId,
    });
    // Receipt email — detached, no-op without RESEND_API_KEY.
    await ctx.scheduler.runAfter(0, internal.catalog.sendOrderReceipt, {
      orderId: args.orderId,
    });
  },
});

/* ------------------------------------------------------------------ */
/* Stripe fulfillment (called by webhook once keys are configured)      */
/* ------------------------------------------------------------------ */

export const markOrderPaid = internalMutation({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
    if (!order) return;
    await ctx.db.patch(order._id, { status: "paid", provider: "stripe" });
  },
});
