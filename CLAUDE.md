# CLAUDE.md — GoodParty marketing site

This is GoodParty.org's public marketing website: a Next.js 15 (App Router) app
with an embedded Sanity CMS, written in TypeScript, run with Bun, deployed on
Vercel. Almost every page is assembled by the marketing team in Sanity Studio out
of reusable building blocks. This repo holds the code behind those blocks and the
programmatic election and candidate pages.

## Who you are working with (read this first)

The person you are helping is usually a **marketing team member, not an engineer**.
They know the site and the content cold, but they do not necessarily read code. So:

- **Talk to them in plain language.** No jargon. When you explain what you changed
  or why something is blocked, say it the way you would to a smart colleague who
  does not code. Skip the type names and file paths unless they ask.
- **You do the technical work.** They describe the outcome they want ("the button
  on the about page should be dark, not cream"); you find the code, make the change,
  and verify it. Do not ask them to run commands or read diffs unless they want to.
- **Always verify before you open a PR.** This codebase fails quietly (see
  "How this repo bites you" below), so a change that looks right can still be broken.
  Never tell the user something works until you have checked it.
- **Know your limits and say so.** Some requests are not marketing-site changes at
  all (for example "this candidate's profile is wrong" is usually a data problem in
  another system). When that is the case, explain it plainly and say who can help,
  rather than attempting a code fix. See `docs/elections.md`.

## What the person can do without you

A large share of routine work needs **no code and no PR** — it is a content edit in
Sanity Studio (copy, images, links, colors, adding blocks to a page, blog posts,
FAQs, redirects). Before writing code, check whether the request is actually a
Studio edit. The dividing line is in **`docs/content-vs-code.md`** — read it early.

## Commands

```bash
bun install                 # install deps
bun run dev                 # dev server on http://localhost:3009
bun run typecheck           # tsc --noEmit  (the ONLY way to catch type errors; the app hides them)
bun run lint                # eslint (next lint)
bun run test                # full test suite (splits .ts unit tests and .tsx DOM tests, see docs)
bun run sanity:extract && bun run sanity:generate   # regenerate Sanity types after any schema change
bun run new:component <PascalName> [--group text]   # scaffold + fully wire a new page-builder block
```

The `/all` route (http://localhost:3009/all) renders every block in the real
pipeline — it is the fastest way to eyeball a new or changed block.

## Verify before you ship (required)

CI enforces three gates on every PR, and they also fail the Vercel build:
`typecheck`, `lint`, and `test`. Run all three locally before opening a PR. The
recommended loop for a visual change: `bun run dev` -> check `/all` (or the affected
page) -> `bun run typecheck` -> `bun run test`.

To open the PR and drive it to approval, use the **`ship-pr`** skill.

## How this repo bites you (important)

Failures here are silent by design, which is exactly why verification is mandatory:

- **Local typecheck lies if the cache is stale.** `tsc` runs incrementally with its
  cache at `node_modules/.tsbuildinfo`. If a local `bun run typecheck` comes back
  clean but you are not sure, run `rm -f node_modules/.tsbuildinfo && bun run typecheck`
  to get the true result. CI has no cache, so it always sees the truth.
- **`next build` checks types that `tsc --noEmit` does not** (Next's generated route
  and layout types). A change can pass `bun run typecheck` and still fail the Vercel
  build. If you touch a `page.tsx` or `layout.tsx` signature, be careful.
- **A broken block still renders (as nothing).** Unknown block types log a console
  warning and render empty; an error boundary swallows render errors. So a
  half-wired component deploys green and only shows up as a missing section on the
  live site. Verify on `/all`.

## Where to look

Read the nearest relevant doc rather than loading everything.

| You're doing                                | Read                                |
| ------------------------------------------- | ----------------------------------- |
| Deciding if a request needs code at all     | `docs/content-vs-code.md`           |
| Understanding the system / how pages render | `docs/architecture.md`              |
| Adding a page-builder block                 | the `new-component` skill           |
| Changing an existing page-builder block     | `docs/adding-a-component.md`        |
| Anything about election or candidate pages  | `docs/elections.md`                 |
| How AirOps writes content into Sanity       | `docs/airops-sanity-integration.md` |
| Opening a PR and getting it approved        | the `ship-pr` skill                 |

## Code style

- **TABS** for indent. Semicolons **on**. Single quotes. 140-char lines. Trailing
  commas everywhere. Arrow functions over `function`. `arrowParens: avoid`.
  A formatter runs on save, so match the surrounding file and let it tidy the rest.
- **No comments** by default. Add one only for a non-obvious _why_. Never remove an
  existing comment unless asked.
- **WET over premature DRY.** Do not extract a helper used once. Prefer the simplest
  thing that works.
- Validation with Zod. Types come from Sanity typegen (`sanity.types.ts`) — that
  file is generated and ~14MB; never hand-edit it and never load it into context.

## Never

- Never hand-edit `sanity.types.ts` or `schema.json` (regenerate them instead).
- Never commit with failing `typecheck`, `lint`, or `test` for code you touched.
- Never attempt a code fix for a candidate data problem (claimed/unclaimed, wrong
  profile data) — that lives in other systems; explain and escalate (`docs/elections.md`).
- Never claim a change works without having verified it (`/all`, typecheck, tests).

## Keep docs current

If a change alters how something works, update the nearest doc in the same PR.
Stale docs are worse than none here, because agents rely on them.
