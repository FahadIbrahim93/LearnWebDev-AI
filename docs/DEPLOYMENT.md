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
name. It is a public deployment URL, not a secret. Set it to the production
Convex deployment URL to enable authentication, saved progress, catalog data,
bookings, showcase data, waitlist storage, and server-backed GitHub stats.

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
curl -I https://fahadibrahim93.github.io/LearnWebDev-AI/lesson
```

Both should return HTTP 200. In a browser, verify the landing hero, the free
lesson link, a direct deep link, and that JavaScript/CSS requests start with
`/LearnWebDev-AI/`. If Convex is configured, also verify sign-in and one
read-only catalog request.

### Rollback

Use the GitHub Actions deployment history to redeploy the last successful
workflow run. For a source rollback, revert the problematic merge on `main`
and rerun **Deploy app to GitHub Pages**. The static site rollback does not
roll back Convex data or functions; deploy the corresponding earlier Convex
revision separately and take care not to remove already-created production
data.
