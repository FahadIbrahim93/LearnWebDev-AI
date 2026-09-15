# Codebase Audit — September 15, 2026

A full A–Z review of every source file in the repository: all 19 Convex
backend functions, all 13 pages, the design-system and interactive-game
components, hooks, lib rules, config, CI, and docs. This is an honest
assessment, not a victory lap — ratings include the flaws.

**Verdict: 8.2 / 10** — production-quality for a v1 course business, with
known, documented scaling limits rather than hidden ones.

---

## Ratings by aspect

| Aspect | Score | One-line rationale |
| --- | --- | --- |
| **Correctness** | 8.5 | Two real bugs found and fixed this pass (see below); auth, payments, booking, and progress logic all verify clean. |
| **Security / access control** | 8.0 | Every admin function re-checks `isAdmin` server-side; every user-owned mutation verifies ownership; one unauthenticated leak found and removed. Booking double-book protection uses OCC-serialized lock rows. |
| **Architecture** | 9.0 | Clear separation: pure rules in `src/lib/courseRules.ts` (tested), backend in Convex, UI primitives in `nb.tsx`. No cross-layer leakage; modules are single-responsibility. |
| **Type safety** | 9.0 | `strict` TS, Convex validators on every function arg, schema validation on, discriminated unions for statuses. Zero `any` in app code. |
| **Testing** | 7.5 | 46 tests, all pure-rule regression tests (dates, validation, progress merge). No component or backend integration tests — the interactive games and Convex handlers rely on manual verification. |
| **Documentation** | 9.0 | README, ARCHITECTURE.md, SHOWCASE.md, and this audit. Every non-obvious backend function carries a comment explaining *why*. |
| **Performance** | 8.0 | Indexed queries throughout; point-reads instead of table scans in admin lists; single-row GitHub cache so public reads never hit the network. Admin tables read unpaginated (deliberate v1 tradeoff, documented in README). |
| **Error handling** | 8.5 | Honest error states in every flow; graceful demo-mode fallbacks for missing Stripe/Resend keys; webhook rejects bad signatures. |
| **UX / accessibility** | 8.0 | Mobile nav, focus rings, keyboard-usable games, honest error copy, print stylesheet for the certificate. Game shakes and confetti are visual-only (no aria-live) — noted below. |
| **Maintainability** | 9.0 | No dead code after this pass; consistent naming; a new developer can navigate from README's code map. |

---

## Issues found and fixed during this audit

### 1. `showcase.getPost` served unapproved posts to anyone (fixed)
A public query that fetched **any** showcase post by ID — including ones
still awaiting moderation. Unapproved drafts were one ID-guess away from
public view, and their comment threads were exposed by `listComments`,
which also never filtered by `approved`. Since nothing used it, it was
deleted outright rather than patched; `listApproved` and the page-level
merge of approved + own-pending posts cover every real use case.

### 2. `admin.listWaitlist` — dead duplicate of `waitlist.listWaitlist` (fixed)
Two admin-gated copies of the same query existed. The page used the one in
`waitlist.ts`; the copy in `admin.ts` was unreachable dead weight that
would have drifted silently on the next schema change. Removed.

### 3. Booking confirmation emails printed the wrong day (fixed earlier this pass)
`date + "T00:00:00"` was parsed in the server's local timezone but formatted
in the student's zone, so for any server west of the student, "Thursday,
March 5" rendered as March 4 in every confirmation and owner email.
Formatting moved into `prettyBookingDate()` in `src/lib/courseRules.ts`
(UTC-anchored, explicit zone) with 4 regression tests across UTC, Berlin,
LA, and Tokyo.

### 4. Cancelled booking slots leaked permanently (fixed earlier this pass)
Both cancel paths (`bookings.cancelBooking` and the owner's
`admin.updateBookingStatus`) deleted a slot's `bookingLocks` row
unconditionally — so if a student rebooked the same slot, cancelling the
*new* booking released the lock while the *old* booking still showed
`confirmed`, letting anyone double-book. Both paths now release the lock
only when no other confirmed booking holds the slot, and admin re-confirm
re-claims the lock, refusing (with rollback-safe throw) if the slot is
already held — closing a double-booking hole in the owner UI.

---

## Known tradeoffs (deliberate, documented — not bugs)

1. **`saveLessonProgress` overwrites rather than union-merges.** Two
   devices can clobber each other's free-lesson step. `saveModuleProgress`
   already merges; the free lesson doesn't because its steps are strictly
   linear. One-file fix if parity is wanted.
2. **`insights.getInsights` reads `MODULE_CONTENT` slugs, not the lessons
   table.** Renaming a module slug in admin leaves its progress rows
   invisible in analytics. Fine while the catalog is seed-controlled.
3. **Stripe webhook doesn't verify `session.payment_status`** before
   fulfillment. Safe today (checkout without payment never emits
   `completed`), worth tightening before real sales volume.
4. **Admin surfaces read unpaginated** (orders, bookings, waitlist,
   progress). Documented in README as the scaling boundary; move to
   `usePaginatedQuery` when tables grow.
5. **Games announce results visually only** (shake/confetti, no
   `aria-live`), so screen readers miss pass/fail feedback.
6. **Guest learners poll funnel analytics.** Anonymous sign-ins count in
   `insights` totals; the caveat is printed on the page, but the data is
   soft. Adding a `isAnonymous` filter is a one-line change when it starts
   misleading decisions.
7. **Test coverage is pure-rules only.** No component tests, no backend
   integration tests. The 46 tests protect the highest-risk logic
   (timezones, validation, progress merge); UI correctness is verified
   manually.

---

## What's genuinely strong

- **Auth flow is textbook:** `returnTo` preserved through sign-in,
  open-redirect blocked, fallback `/dashboard`, admin checks repeated in
  every backend handler (never trusted from the client).
- **Money paths are defensive:** OCC-serialized slot locks, webhook
  signature verification, demo-mode fallbacks that can't accidentally
  charge anyone, idempotent waitlist joins.
- **The "pure rules in one tested place" pattern is real:** dates,
  email validation, progress merging, and pricing all live in
  `src/lib/courseRules.ts` with regression tests — the bugs fixed in this
  audit were fixed in testable code, not scattered call sites.
- **Honest product surface:** demo checkout is labeled, missing keys
  degrade visibly but never crash, and the analytics page prints its own
  caveats.
- **Docs match the code.** README's code map, ARCHITECTURE.md's request
  flow, and the go-live checklist all verify against the actual source.

## What would raise the score

| To reach | Do this |
| --- | --- |
| 9.0+ | Merge-fix `saveLessonProgress` (finding 1) and add `aria-live` to game feedback (finding 5). |
| 9.5 | Add component tests for the interactive games and a Convex test for the booking-lock paths; tighten the Stripe webhook (finding 3). |
| 10 | Paginated admin tables + pre-aggregated insights,slug-driven analytics (finding 2), and real-user email deliverability verification. |
