# Deploying WordVale

The app is a static client-side build (`dist/`) — no server, no env vars, no secrets.
Anything that serves static files works; Vercel is the default.

Repo: <https://github.com/faeezmnoor/wordvale> (private)

## First deploy (one time, needs Faeez's Vercel account)

**Option A — dashboard import (recommended: auto-deploys on every push)**

1. Go to <https://vercel.com/new>
2. Import `faeezmnoor/wordvale` (authorize GitHub access if prompted — a private repo is fine)
3. Accept the detected settings and press **Deploy**. `vercel.json` already pins them:
   framework Vite · build `bun run build` · output `dist`
4. Every push to `main` redeploys automatically; pull requests get preview URLs.

**Option B — CLI**

```bash
cd ~/dev/projects/wordvale
npx vercel login     # opens the browser
npx vercel --prod    # first run asks a few questions; accept the defaults
```

## After deploying

- Open the URL **on a phone** — the on-screen keyboard and the fit-to-panel grid are the two
  things worth confirming on real hardware.
- Puzzles are stored per browser (IndexedDB), so the deployed site starts empty even though
  local dev has saved puzzles. That's expected — there's no account system.

## Notes

- **Bun on Vercel:** `bun.lock` is committed, so Vercel installs with Bun. If a build ever fails
  on the install step, change the install command to `npm install` in project settings — the
  `package.json` has everything and nothing depends on Bun at runtime.
- **Caching:** `vercel.json` sets immutable one-year caching for `/assets/*` (content-hashed by
  Vite). `index.html` stays uncached, so a redeploy is picked up immediately.
- **The rewrite rule** sends all paths to `index.html`. There's no router today, but this keeps
  deep links working if one is added.
- **No env vars, no secrets** — if that ever changes, note it here before deploying.
