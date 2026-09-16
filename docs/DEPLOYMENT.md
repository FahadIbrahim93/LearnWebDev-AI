# Deployment

## GitHub Pages

The production static app is published at
<https://fahadibrahim93.github.io/LearnWebDev-AI/>.

`.github/workflows/deploy-pages.yml` builds from `main` and deploys the
`dist` artifact with the official GitHub Pages actions. It runs after normal
application changes and can also be started with **Actions → Deploy app to
GitHub Pages → Run workflow**. Documentation-only and Convex-only pushes do
not rebuild the frontend; Convex-only changes are handled by
`deploy-convex.yml`.

The workflow sets `VITE_BASE_PATH=/LearnWebDev-AI/`. Vite uses that value for
bundled assets and React Router uses it as its basename. The build also copies
`index.html` to `404.html`, which lets GitHub Pages serve the SPA entry point
for direct links such as `/lesson` or `/catalog`.

### One-time Pages settings

1. Open **Settings → Pages** for `FahadIbrahim93/LearnWebDev-AI`.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Confirm the `github-pages` environment is allowed to deploy from `main`.
4. Push to `main` or run the deployment workflow manually.

The workflow does not use a custom domain. If a custom domain is added later,
update the Pages setting and the canonical URL in this document.

### Configuration and demo mode

`VITE_CONVEX_URL` is read from the repository Actions variable of the same
name (or the same-named Actions secret as a compatibility fallback). It is a
public deployment URL, not a secret. The Pages workflow also injects the
public `VITE_CONVEX_SITE_URL`, `VITE_VLY_APP_ID`, and
`VITE_VLY_MONITORING_URL` variables when present. Set these to the values for
the intended Convex/Vly deployment to enable authentication, saved progress,
catalog data, bookings, showcase data, waitlist storage, and server-backed
GitHub stats.

### Current production blocker

The supplied Vly values point to the Convex development deployment
`dev:acrobatic-gull-252`, not a production deployment. This is sufficient for
frontend connectivity and testing, but it is not an appropriate production
data boundary. A production Convex project/deploy key and its auth issuer
should replace it before real users or payments rely on the site.

One-time owner action:

1. Sign in to <https://dashboard.convex.dev> and create/select a production
   Convex project.
2. Configure `VLY_CONVEX_AUTH_ISSUER` and any other required Convex auth
   environment values in that production deployment.
3. Create a production deploy key and add it as `CONVEX_DEPLOY_KEY`.
4. Replace the five public Actions variables with the production deployment
   values, then run **Deploy Convex (prod)** and **Deploy app to GitHub Pages**.

Pages now receives the supplied development URL, so it renders the full
Convex-backed React app rather than the static fallback. Stripe and Resend
still require their server-only Convex environment secrets before payments or
transactional email are live.

When that variable is absent, the build still succeeds and the deployed
landing experience renders an explicit static demo page. No Stripe,
Resend, Convex deploy key, or other secret is bundled into the frontend.
Demo mode cannot save data or perform authenticated/backend actions.

Stripe and Resend secrets belong in the Convex production environment, not
GitHub Pages. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `EMAIL_FROM`, and optional `OWNER_EMAIL` in Convex before
accepting real payments or sending real email. GitHub Pages is static and
cannot host Convex functions, Stripe webhooks, or Resend server actions.

### Validation and verification

Run the same checks locally before merging:

```bash
bun install --frozen-lockfile
bun tsc -b --noEmit
bun run lint
bun run test
VITE_BASE_PATH=/LearnWebDev-AI/ bun run build
```

For a deployed check, confirm:

```bash
curl -I https://fahadibrahim93.github.io/LearnWebDev-AI/
curl https://fahadibrahim93.github.io/LearnWebDev-AI/lesson
```

The root should return HTTP 200 and contain the app shell. A direct deep link
should contain the same app shell through `404.html`; GitHub Pages may retain
an HTTP 404 status for that fallback document even though the browser loads
the SPA and React Router resolves the route. In a browser, verify the landing
hero, the free lesson link, a direct deep link, and that JavaScript/CSS
requests start with `/LearnWebDev-AI/`. If Convex is configured, also verify
sign-in and one read-only catalog request.

### Rollback

Use the GitHub Actions deployment history to redeploy the last successful
workflow run. For a source rollback, revert the problematic merge on `main`
and rerun **Deploy app to GitHub Pages**. The static site rollback does not
roll back Convex data or functions; deploy the corresponding earlier Convex
revision separately and take care not to remove already-created production
data.
