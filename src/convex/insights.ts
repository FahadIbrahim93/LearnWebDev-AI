import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { MODULE_CONTENT } from "./moduleContent";

const LESSON_ID = "webdev-ai-v1";
const LESSON_STEPS = [
  "What is a website?",
  "What is it made of?",
  "Where does AI fit in?",
  "Build one yourself",
];

/**
 * Admin-only learner analytics, computed from tables we already collect.
 * Honest caveat: the free lesson is playable by guests, so "learners" counts
 * only signed-in progress rows — real but partial for the top of funnel.
 */
export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const me = userId ? await ctx.db.get(userId) : null;
    if (!me?.isAdmin) return null;

    // --- Free-lesson funnel (signed-in learners) -------------------------
    const lessonRows = await ctx.db
      .query("lessonProgress")
      .filter((q) => q.eq(q.field("lessonId"), LESSON_ID))
      .collect();
    const funnel = LESSON_STEPS.map((title, i) => ({
      title,
      reached: lessonRows.filter((r) => r.completedSteps.includes(i)).length,
    }));

    // --- Module engagement (progress is signed-in by design) -------------
    const progressRows = await ctx.db.query("moduleProgress").collect();
    const orders = await ctx.db.query("orders").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const waitlist = await ctx.db.query("waitlist").collect();
    const lessons = await ctx.db.query("lessons").collect();
    const titleBySlug = new Map(lessons.map((l) => [l.slug, l.title] as const));

    const modules = MODULE_CONTENT.map((m) => {
      const rows = progressRows.filter((r) => r.moduleSlug === m.slug);
      const total = m.sections.length;
      const purchased = orders.filter(
        (o) => o.lessonSlug === m.slug && o.status === "paid",
      ).length;
      return {
        slug: m.slug,
        title: titleBySlug.get(m.slug) ?? m.slug,
        sections: total,
        started: rows.filter((r) => r.doneSections.length > 0).length,
        completed: rows.filter((r) => r.doneSections.length >= total).length,
        purchased,
      };
    });

    return {
      totals: {
        learnersTracked: lessonRows.length,
        purchases: orders.filter((o) => o.status === "paid").length,
        bookings: bookings.filter((b) => b.status === "confirmed").length,
        waitlist: waitlist.length,
      },
      funnel,
      modules,
    };
  },
});
