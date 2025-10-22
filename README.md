## DSP Frontend

### Description

**DSP Frontend** is a SvelteKit application that powers the DSP web experience. It integrates with a backend API and Sanity CMS to provide landing pages, authentication, dashboard and progress tracking, levels/lessons with a custom video player (captions, chapters, gestures), and subscription management.

### Project structure (brief)

```text
src/
  lib/
    api/            # Axios client and API helpers
    components/     # UI components (system, landing, dashboard, video, etc.)
    server/         # Server-side utilities (Sanity client, env helpers)
    services/       # Domain services (levels, profile, progress, subscription)
    stores/         # Svelte stores (app, navigation, user profile, etc.)
    utils/          # Utilities (images, dates, subscriptions, etc.)
  routes/           # SvelteKit routes (landing, auth, dashboard, levels)
  styles/           # Global SCSS and design tokens
  types/            # Shared TypeScript types
static/             # Public assets
vite.config.ts      # Vite + dev server proxy
svelte.config.js    # SvelteKit config
package.json        # Scripts and dependencies
```

### Environment

- **PUBLIC_API_URL**: Base URL of the backend API for the dev proxy and production requests (example: `https://api.example.com`).
- **SANITY_PROJECT_ID**: Sanity project ID (server-only/private).
- **SANITY_API_TOKEN**: Sanity token (server-only/private). Optional; used on staging to preview drafts.
- **SANITY_ENV**: Sanity environment flag: `staging` or `production`. Controls whether drafts are included (`staging` includes drafts).

Example `.env` (root):

````bash
# Backend API
PUBLIC_API_URL="https://your-api.example.com"

# Sanity (server/private)
SANITY_PROJECT_ID="your-sanity-project-id"
SANITY_API_TOKEN="your-sanity-token"    # optional
SANITY_ENV=staging                       # or production

Notes:

- Variables prefixed with `PUBLIC_` are available to browser code; others remain server-only.
- In development, the dev server proxies `/api` to `PUBLIC_API_URL` (see `vite.config.ts`).

### Run and build

Install dependencies (pnpm recommended):

```bash
pnpm install
````

Start the dev server:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```
