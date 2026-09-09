# Web Development with AI

An interactive course platform that teaches everyday people — shop owners,
freelancers, students, the curious — how to build a professional website for
themselves, with AI as their typing assistant. No coding background required.

Built as a real, sellable product: catalog + checkout + bookings + community
+ admin, all in one app.

## What's inside

### For learners
- **Free interactive lesson** — a 4-step, click-through lesson that teaches
  what a website is, what it's made of, and where AI fits in. Ends with the
  learner building a small site themselves (vibe + color + words → live
  preview). Progress is saved locally and to the cloud when signed in.
- **Course player** — owned modules open a dedicated learning view with the
  full written curriculum: short lessons, plain-language explanations, and a
  hands-on exercise at the end of every section. Section completion is saved
  per user, so learners always resume where they stopped.
- **Course catalog** — searchable, filterable modules with detail pages,
  one-time pricing, and free/paid tiers.
- **Checkout** — real Stripe Checkout when keys are configured; a clearly
  labeled demo checkout (no money moves) when they aren't.
- **1:1 session booking** — pick a day, see live slot availability, confirm.
- **Student showcase** — submit your build for review, browse approved
  projects, and comment on classmates' work.
- **Waitlist** — a pre-launch email capture on the landing page, stored in
  your own database (no third-party dependency). Counts are visible in the
  admin overview so you can gauge demand before promoting the course.
- **Dashboard** — lesson progress, owned modules with one-click access to
  the course player, upcoming sessions, all in one place.

### For the course owner (admin area at `/admin`)
- Revenue, order, and waitlist overview
- Full lesson CRUD: create, edit, publish/unpublish, delete modules
- Order log
- Session bookings with student notes
- Showcase moderation (approve/reject submissions)

## Tech stack
- **React 19 + Vite + TypeScript** — frontend
- **Tailwind CSS v4** with a custom **Neobrutalism Minimalism** design system
  (square corners, 2px borders, flat color blocks, hard offset shadows) and a
  full **dark developer-facing mode**
- **Convex** — database, auth (email OTP + guest), realtime queries,
  background-safe server functions
- **Stripe** — hosted checkout + signature-verified webhook fulfillment
- **Framer Motion** — tasteful motion where it aids comprehension

## Running locally
```bash
bun install
bun convex dev --once   # generate backend types
bun tsc -b --noEmit     # typecheck
```
The platform runs the dev server automatically; never run `bun run dev`
manually in this environment.

## Going live with payments
1. Create a Stripe account and grab your keys.
2. Add these env vars via the project's Keys/API keys UI:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - (optional) `STRIPE_SITE_URL` — defaults to the current origin
3. In the Stripe dashboard, add a webhook endpoint pointing at
   `https://<your-convex-domain>/stripe_webhook` listening for
   `checkout.session.completed`, and paste the signing secret as
   `STRIPE_WEBHOOK_SECRET`.

Until keys exist, checkout runs in demo mode: orders are created and marked
paid without charging anyone, so the whole flow is demo-able safely.

## First-run notes
- The catalog self-seeds with 6 starter modules on first visit.
- The first person to visit `/admin` and click **Claim admin** becomes the
  course owner. Do this right after deploying so nobody else can.
