# Web Development with AI

An interactive course platform that teaches everyday people — shop owners,
freelancers, students, the curious — how to build a professional website for
themselves, with AI as their typing assistant. No coding background required.

Built as a real, sellable product: catalog + checkout + bookings + community
+ admin, all in one app.

**Design system:** Neobrutalism Minimalism — square corners, 2px black
borders, flat color blocking, hard offset shadows, bold but controlled
contrast, and a full dark developer-facing mode.

## What's inside

### For learners
- **Free interactive lesson** — a 4-step, click-through lesson that teaches
  what a website is, what it's made of, and where AI fits in. Ends with the
  learner building a small site themselves (vibe + color + words → live
  preview). Progress is saved locally and to the cloud when signed in.
- **Course player** — owned modules open a dedicated learning view with the
  full written curriculum: short lessons, plain-language explanations, and a
  hands-on exercise at the end of every section. Progress (done + solved
  challenges) lives in localStorage **and** in the database for signed-in
  learners, merged on load — so switching devices adds progress instead of
  losing it. The dashboard shows a per-module progress bar and percentage.
- **Interactive challenges in every section** — each of the 18 sections ends
  in a mini-game that must be solved before the section can be checked off:
  step-ordering puzzles, analogy matching, pick-the-best-prompt, form and
  shot-list editors (keep / cut), prompt assembly, launch checklists, and
  quick quizzes. Solving one triggers a confetti reward; wrong answers shake
  with honest explanations of why. Progress (done + solved) persists per
  user, and finishing a module earns a stamped completion card.
- **Learn-by-doing everywhere** — the free 4-step lesson keeps its original
  interactive demos (fake browser journey, hotspots, café builder), and the
  paid modules now teach the same way: every concept is followed by a thing
  to *do*, not just read.
- **Course catalog** — searchable, filterable modules with detail pages,
  one-time pricing, and free/paid tiers. Each detail page includes a "peek
  inside" preview: the real section titles with their hands-on challenges,
  so buyers can judge the teaching before paying.
- **Checkout** — real Stripe Checkout when keys are configured; a clearly
  labeled demo checkout (no money moves) when they aren't.
- **1:1 session booking** — pick a day, see live slot availability, confirm.
  The student's timezone is auto-detected, stored with the booking, shown in
  the admin Sessions tab, and included in the confirmation email.
- **Transactional email (Resend)** — booking confirmations and purchase
  receipts are sent through Resend's API. Without a `RESEND_API_KEY` the
  sends are silent no-ops (demo mode); paste the key and they become real
  emails. For production deliverability, verify your domain in Resend and
  update the `FROM` address in `src/convex/emails.ts`.
- **Student showcase** — submit your build for review, browse approved
  projects, and comment on classmates' work. Approved projects also appear
  automatically as social proof on the landing page.
- **Waitlist** — a pre-launch email capture on the landing page, stored in
  your own database (no third-party dependency). Counts are visible in the
  admin overview so you can gauge demand before promoting the course.
- **Printable certificate** — finishing the free lesson unlocks a branded,
  printable certificate (with a shareable link) — a motivator for students
  and free word-of-mouth for the course. For signed-in learners the
  certificate verifies real completion before it renders.
- **Mobile-first navigation** — a hamburger menu on phones, so every page is
  reachable on the devices most non-technical learners actually use.
- **Dashboard** — lesson progress, owned modules with one-click access to
  the course player, upcoming sessions, all in one place.

### For the course owner (admin area at `/admin`)
- Revenue, order, and waitlist overview
- **Insights tab** — free-lesson funnel (which of the 4 steps learners
  reach), per-module engagement (started / finished / bought), and headline
  totals. Computed live from your own data; the honest caveat about guest
  learners is printed right on the page.
- Full lesson CRUD: create, edit, publish/unpublish, delete modules
- Order log with buyer name + email (refund/support follow-ups)
- Session bookings with student name, email, private notes — and owner
  controls to cancel a session
- Waitlist viewer with one-click copy-all of collected emails
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

## Architecture & code map

```
src/
├── components/
│   ├── nb.tsx                    # Neobrutalism design-system primitives
│   │                             #   (NbSection, NbBox, NbButton, NbQuiz…)
│   ├── BrowserSim.tsx            # Fake-browser teaching widget (free lesson)
│   ├── SiteHeader.tsx            # Shared nav + dark-mode toggle + mobile menu
│   ├── interactive/              # 9 mini-games used across all courses
│   │   ├── games.tsx             #   ordering + analogy matching
│   │   ├── games2.tsx            #   pick-best, prompt builder, vibe switcher…
│   │   ├── NbChecklistGame.tsx   #   launch-day checklist
│   │   ├── NbSpotTheDifferenceGame.tsx
│   │   ├── NbConfetti.tsx        #   CSS-only confetti (zero deps)
│   │   └── SectionActivity.tsx   #   game dispatcher wiring solve→progress
│   └── lesson/                   # Free lesson: Steps 1–4
├── convex/                       # Backend (queries, mutations, actions)
│   ├── schema.ts                 #   users, lessons, orders, bookings,
│   │                             #   showcase, comments, waitlist, progress
│   ├── moduleContent.ts          #   6 modules × 3 sections of curriculum
│   │                             #   + per-section interactive challenge data
│   ├── catalog.ts / stripe.ts    #   purchase flow + webhook fulfillment
│   ├── bookings.ts / emails.ts   #   1:1 sessions + Resend transactional email
│   ├── showcase.ts / admin.ts    #   community + owner tools
│   └── insights.ts               #   admin analytics (funnel + engagement)
├── pages/                        # Landing, Lesson, Catalog, CatalogItem,
│   # CoursePlayer, Book, Showcase, Certificate, Dashboard, Admin, Auth
├── hooks/                        # use-auth, use-nb-mode, use-page-title
└── lib/utils.ts                  # cn() and helpers
```

**Patterns worth noting**
- **Progress that survives devices** — local progress (per-user localStorage)
  is union-merged with server progress on load, so signing in adds history
  instead of overwriting it. Merge-safe writes on both ends.
- **Challenge-gated completion** — sections can't be marked done until their
  interactive challenge is solved, keeping the course learn-by-doing rather
  than read-and-click-next.
- **Graceful degradation everywhere** — missing Stripe/Resend keys fall back
  to labeled demo mode, never errors; the product is demoable with zero keys.
- **Dormant-by-default integrations** — paste env vars via the Keys UI and
  live payments/email activate with no code changes.
- **State discipline** — no setState-in-effect cascades; server data is merged
  via derived values and the React render-adjustment pattern.

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
   - (optional) `STRIPE_SITE_URL` — used for checkout redirects and the
     purchase-receipt link
   - (optional) `OWNER_EMAIL` — your email, enables owner notifications
3. In the Stripe dashboard, add a webhook endpoint pointing at
   `https://<your-convex-domain>/stripe_webhook` listening for
   `checkout.session.completed`, and paste the signing secret as
   `STRIPE_WEBHOOK_SECRET`.

## Turning on real emails
1. Create a Resend account and grab an API key.
2. Add `RESEND_API_KEY` via the project's Keys/API keys UI.
3. (Recommended) Verify your sending domain in Resend and change the `FROM`
   constant in `src/convex/emails.ts` to your domain.

Booking confirmations and purchase receipts start flowing immediately —
no other code changes needed.

**Optional — get notified yourself:** add `OWNER_EMAIL` (your email
address) alongside the Resend key, and you'll also receive a short email
for every new booking and purchase. Without it, owner notifications stay
silent no-ops.

Until keys exist, checkout runs in demo mode: orders are created and marked
paid without charging anyone, so the whole flow is demo-able safely.

## First-run notes
- The catalog self-seeds with 6 starter modules on first visit.
- The first person to visit `/admin` and click **Claim admin** becomes the
  course owner. Do this right after deploying so nobody else can.
