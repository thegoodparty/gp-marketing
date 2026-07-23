# gp-marketing

GoodParty.org's public marketing website. A Next.js 15 (App Router) app with an
embedded Sanity CMS, written in TypeScript and run with [Bun](https://bun.sh).
Deployed on Vercel.

Most pages are assembled by the marketing team in Sanity Studio out of reusable
blocks; this repo holds the code behind those blocks plus the programmatic election
and candidate pages.

## Quick start

Requires Bun 1.2.23+ and Node 22+.

```bash
bun install
bun run dev        # http://localhost:3009
```

Sanity Studio (the CMS) is served by the same app at `/studio/main`.

## Checks

CI runs these on every PR, and they also gate the Vercel build. Run them before
opening a PR:

```bash
bun run typecheck  # tsc --noEmit
bun run lint       # eslint
bun run test       # unit (.ts) + DOM (.tsx) test suites
```

After changing any Sanity schema, regenerate the generated types:

```bash
bun run sanity:extract && bun run sanity:generate
```

Useful during development: the `/all` route renders every block through the real
rendering pipeline, so it is the quickest way to preview a new or changed block.

## Working in this repo

This repo is built to be worked through coding agents. Start with **`CLAUDE.md`**
in the repo root, then follow its pointers into `docs/`:

- `docs/content-vs-code.md` — whether a request needs code at all, or is a Sanity edit
- `docs/architecture.md` — how the system fits together and how pages render
- `docs/adding-a-component.md` — how to add a new page-builder block
- `docs/elections.md` — the election and candidate pages
- `docs/airops-sanity-integration.md` — how AirOps writes content into Sanity

## Branches and deploys

`develop` -> `master` deploy to the dev, and prod environments on Vercel.
Content published in Sanity Studio goes live without a rebuild (a webhook revalidates
the affected pages).
