import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Join the pre-launch waitlist. Idempotent per email. */
export const joinWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("That doesn't look like an email address.");
    }
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return { alreadyJoined: true as const };

    await ctx.db.insert("waitlist", { email, createdAt: Date.now() });
    return { alreadyJoined: false as const };
  },
});

/** Public: count only — no personal data leaves the server. */
export const countWaitlist = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("waitlist").collect();
  },
});

/** Admin only: full list with emails + signup dates. */
export const listWaitlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (!me?.isAdmin) return [];
    return await ctx.db.query("waitlist").collect();
  },
});
