import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

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
    // Admins only — bookings include the student's private note.
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (!me?.isAdmin) return [];
    return await ctx.db.query("bookings").collect();
  },
});

/** All bookings joined with the student's name + email (admin only). */
export const listAllBookingsWithUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (!me?.isAdmin) return [];
    const bookings = await ctx.db.query("bookings").collect();
    const users = await ctx.db.query("users").collect();
    const byId = new Map(users.map((u) => [u._id, u] as const));
    return bookings.map((b) => {
      const u = byId.get(b.userId);
      return {
        ...b,
        studentName: u?.name ?? null,
        studentEmail: u?.email ?? null,
      };
    });
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

    const bookingId = await ctx.db.insert("bookings", {
      userId,
      lessonSlug: args.lessonSlug,
      date: args.date,
      time: args.time,
      note: args.note,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // Confirmation email — detached, never blocks or fails the booking.
    await ctx.scheduler.runAfter(0, internal.bookings.sendBookingConfirmation, {
      bookingId,
    });

    return bookingId;
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

/**
 * After a booking is confirmed, queue a confirmation email (no-op unless an
 * email API key is configured). Runs detached so the UI never waits on it.
 */
export const sendBookingConfirmation = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return;
    const user = await ctx.db.get(booking.userId);
    const email = user?.email;
    if (!email) return;
    const pretty = new Date(booking.date + "T00:00:00").toLocaleDateString(
      "en-US",
      { weekday: "long", month: "long", day: "numeric" },
    );
    await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
      to: email,
      subject: `Your session is booked — ${pretty} at ${booking.time}`,
      text: [
        `Hi${user?.name ? ` ${user.name}` : ""},`,
        ``,
        `Your 1:1 session is confirmed for ${pretty} at ${booking.time} (30 minutes).`,
        ``,
        booking.note ? `You mentioned: "${booking.note}"` : ``,
        ``,
        `A video-call link arrives before we meet. Bring questions and your`,
        `current progress — see you then!`,
        ``,
        `— Web Development with AI`,
      ]
        .filter((l) => l !== ``)
        .join("\n"),
    });
  },
});
