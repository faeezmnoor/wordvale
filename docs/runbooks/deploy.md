<!-- layer: knowledge · status: living · verified: 2026-10-06 -->
# Runbook — Deploying WordVale

The app is a static client-side build (`dist/`): no server, no env vars, no secrets. Anything that serves static files works; Vercel is the default.

- Live: <https://wordvale-two.vercel.app> (public production URL; `wordvale.vercel.app` was taken, so Vercel assigned the `-two` suffix)
- First deployed 2026-08-12 with `vercel --prod`.

## When to use this
Use it to confirm a deploy after a change reaches main, to deploy a working tree by hand, or to set the project up again from scratch. Normally there is nothing to do: pushing to main deploys on its own.

## Preconditions
| Needs | Check | Expected |
| --- | --- | --- |
| Dependencies installed | `bun install --frozen-lockfile` | exits 0 |
| Checks pass | `bun run check` | exits 0 |
| Build passes | `bun run build` | exits 0; `dist/` exists |
| Vercel access (manual deploy only) | `npx vercel whoami` | prints the signed-in account |

## Steps
1. Automatic path: merge to main. The Vercel project is connected to the GitHub repository, so the push builds and promotes to production (verified 2026-08-12 with an empty commit: a new production deployment appeared about 45 seconds later). Pull requests get their own preview URLs.
2. Manual path, to deploy the working tree without committing:
   ```
   npx vercel --prod
   ```
   Expected: a line ending in the production URL.
3. First-time setup, option A (recommended, auto-deploys on every push): import the repository at <https://vercel.com/new>, accept the detected settings and press Deploy. `vercel.json` pins them: framework Vite, build `bun run build`, output `dist`.
4. First-time setup, option B: `npx vercel login`, then `npx vercel --prod` and accept the defaults.

## Verification
```
curl -sI https://wordvale-two.vercel.app | head -1
```
Expected: `HTTP/2 200`. Then open the URL on a phone: the on-screen keyboard and the fit-to-panel grid are the two things worth confirming on real hardware. Puzzles are stored per browser (IndexedDB), so the deployed site starts empty; there is no account system.

## Rollback
1. In the Vercel dashboard, open the project's Deployments list and promote the last good production deployment, or revert the commit on main and merge the revert.

Notes worth knowing:
- Per-deployment URLs and the team-scoped alias sit behind Vercel's Deployment Protection SSO and redirect to a login for anyone not signed in; share only the public alias above.
- A custom domain can be added under Project, Settings, Domains.
- Bun on Vercel: `bun.lock` is committed, so Vercel installs with Bun. If a build ever fails on the install step, change the install command to `npm install` in project settings; nothing depends on Bun at runtime.
- Caching: `vercel.json` sets immutable one-year caching for `/assets/*` (content-hashed by Vite); `index.html` stays uncached.
- The rewrite rule sends all paths to `index.html`; there is no router today, but it keeps deep links working if one is added.
- No env vars and no secrets: if that changes, note it here before deploying.

## Last run
2026-08-12 · automatic deploy check · succeeded (new production deployment about 45 seconds after the push)
