/**
 * Email — transactional sends via the Resend REST API, called only from
 * scheduled internal functions. No key configured = a silent no-op, so the
 * product works perfectly in demo mode; paste RESEND_API_KEY and every
 * confirmation/receipt becomes a real email. (Same dormant-by-default
 * pattern as the Stripe integration.)
 *
 * This file runs in Node ("use node") because it calls fetch with auth.
 */
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const FROM = "Web Development with AI <onboarding@resend.dev>";

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    text: v.string(),
  },
  handler: async (_ctx, args) => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // Demo mode: no key, no email — log instead of failing the schedule.
      console.info(`[email:noop] Would send to ${args.to}: ${args.subject}`);
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [args.to],
        subject: args.subject,
        text: args.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend send failed (${res.status}): ${body}`);
    }
  },
});
