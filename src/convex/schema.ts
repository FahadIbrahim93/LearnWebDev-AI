import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const levelValidator = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("cancelled"),
);

const bookingStatusValidator = v.union(
  v.literal("confirmed"),
  v.literal("cancelled"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      isAdmin: v.optional(v.boolean()),
    }).index("email", ["email"]),

    // lesson progress for the interactive lesson
    lessonProgress: defineTable({
      userId: v.id("users"),
      lessonId: v.string(),
      step: v.number(),
      completedSteps: v.array(v.number()),
      updatedAt: v.number(),
    }).index("by_user_lesson", ["userId", "lessonId"]),

    // purchasable catalog of course modules
    lessons: defineTable({
      slug: v.string(),
      title: v.string(),
      tagline: v.string(),
      description: v.string(),
      level: levelValidator,
      priceCents: v.number(),
      isFree: v.boolean(),
      isPublished: v.boolean(),
      minutes: v.number(),
      topics: v.array(v.string()),
      order: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_published", ["isPublished"]),

    // one-time purchases
    orders: defineTable({
      userId: v.id("users"),
      lessonSlug: v.string(),
      amountCents: v.number(),
      status: orderStatusValidator,
      provider: v.optional(v.string()), // "demo" | "stripe"
      stripeSessionId: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_session", ["stripeSessionId"]),

    // 1:1 mentor session bookings
    bookings: defineTable({
      userId: v.id("users"),
      lessonSlug: v.string(),
      date: v.string(), // YYYY-MM-DD
      time: v.string(), // HH:MM (24h)
      note: v.optional(v.string()),
      status: bookingStatusValidator,
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_date", ["date"]),

    // student builds
    showcase: defineTable({
      userId: v.id("users"),
      authorName: v.optional(v.string()),
      title: v.string(),
      url: v.optional(v.string()),
      description: v.string(),
      approved: v.boolean(),
      createdAt: v.number(),
    }).index("by_approved", ["approved"]),

    // comments on showcase posts
    comments: defineTable({
      postId: v.id("showcase"),
      userId: v.id("users"),
      authorName: v.optional(v.string()),
      body: v.string(),
      createdAt: v.number(),
    }).index("by_post", ["postId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
