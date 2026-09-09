import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listAllBookings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").collect();
  },
});

/** Slots are half-hour blocks between 09:00 and 17:30. */
export const listTakenSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    return all
      .filter((b) => b.status === "confirmed")
      .map((b) => b.time);
  },
});

export const createBooking = mutation({
  args: {
    lessonSlug: v.string(),
    date: v.string(),
    time: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to book a session.");

    const taken = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    if (taken.some((b) => b.time === args.time && b.status === "confirmed")) {
      throw new Error("That slot was just taken — pick another.");
    }

    return await ctx.db.insert("bookings", {
      userId,
      lessonSlug: args.lessonSlug,
      date: args.date,
      time: args.time,
      note: args.note,
      status: "confirmed",
      createdAt: Date.now(),
    });
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== userId) throw new Error("Booking not found.");
    await ctx.db.patch(args.bookingId, { status: "cancelled" });
  },
});
