import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

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
    return args.orderId;
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
