# Architecture

How the marketing site fits together. This is the map, not the manual. Read the
nearest detailed doc when you start work in an area (see the pointer table at the
bottom).

## Who reads this

The person driving you is often a marketing teammate who is not an engineer. This
doc is your technical reference, so it is precise. But when you report status or
results back to them, use plain language and short sentences. No jargon, no code
unless they ask. Say what changed and what they can see, not how the pipeline works.

## What this is

The public GoodParty.org marketing site. It is a Next.js 15 App Router app with an
embedded Sanity Studio CMS, built and run with Bun, deployed on Vercel. Content
(pages, copy, images, blog, FAQs, blocks on a page) is edited in Sanity by the
marketing team with no code change. Code (new block types, new fields, styling,
programmatic election pages, integrations) lives in this repo and ships through a
pull request. The rule of thumb: editing content inside an existing block is Sanity;
changing what a block is or how it behaves is code.

## Tech stack

| Thing           | What                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router), React 19                                                                                            |
| Language        | TypeScript                                                                                                                   |
| Package manager | Bun 1.2.23 (`packageManager` pin). Node >= 22                                                                                |
| CMS             | Sanity v4, Studio embedded at `/studio/main`                                                                                 |
| Styling         | Tailwind CSS v4 (PostCSS), design tokens in `src/ui/_styles/`, `tailwind-variants` + `clsx`/`tailwind-merge`. No CSS modules |
| Component docs  | Storybook 10 (`bun run sb:dev`, port 6006), Chromatic for visual regression                                                  |
| Analytics       | Amplitude (browser SDK + Experiment for A/B tests), Vercel Analytics + Speed Insights                                        |
| Video           | Mux (`@mux/mux-player-react`, `sanity-plugin-mux-input`)                                                                     |
| Dev server      | `bun run dev` on http://localhost:3009 (Turbopack)                                                                           |

There is one site channel, `goodpartyOrg` (`sites.ts`), titled Goodparty.org.

## The page-builder rendering pipeline

Pages are built in Sanity from a list of blocks (the page builder). Each block is a
Sanity object with a `_type` like `component_statsBlock`. Rendering a page walks that
list and turns each block into a React component. The chain, in order:

1. Sanity block, identified by its `_type` (schema in
   `src/sanity/schema/components/component_<Name>.ts`).
2. GROQ projection in `src/sanity/groq.ts` fetches the block's data. Every block type
   must be appended to the big `sectionsGroq` query, or it fetches nothing and
   renders empty. This is the single most common "it disappeared" bug.
3. The `switch (section._type)` in `src/PageSections/index.tsx` matches the `_type`
   to a `case` and renders the matching section wrapper.
4. The section wrapper (`src/PageSections/<Name>Section.tsx`) maps CMS field names to
   the UI component's props and resolves colors/layout via helpers in `src/ui/_lib/`.
5. The presentational component (`src/ui/<Name>.tsx`) is the actual markup and styles.

Every case is wrapped in a `ComponentErrorBoundary`, so a single broken block will
not take down the whole page. There are roughly 45 registered block types today.
Adding one touches about five files. Full recipe: `docs/adding-a-component.md`.

Warning: type and lint errors are enforced (`next.config.ts` sets
`typescript.ignoreBuildErrors: false` and `eslint.ignoreDuringBuilds: false`, and CI
gates every PR on `typecheck`, `lint`, and `test`), but a half-registered block still
deploys green and just renders nothing, because the error boundary swallows it. So
verify visually on `/all` and run `bun run typecheck` by hand after schema, GROQ, or
component changes.

## Sanity CMS integration

The Studio is embedded in the app, not a separate deploy. It lives at `/studio/main`
(`sanity.config.ts`, `name: 'main'`). Editors get live preview through Sanity's
Presentation tool, so they can see draft changes rendered in the real site before
publishing.

The schema is decomposed under `src/sanity/schema/`:

- `documents/` — content document types (article, faq, person, pricingPlan, the
  `goodpartyOrg_*` singletons like home/navigation/footer, etc.). Editing these is
  pure content work.
- `components/` — the page-builder block types (`component_*`), registered through
  `componentSchema.ts`.
- `lists/list_pageSections.ts` — controls which blocks are valid on a page and which
  appear in the editor's "add block" menu.

The `/all` route (`src/app/all/page.tsx`) renders the `goodpartyOrg_allComponents`
Sanity doc through the real `PageSections` switch. It is a live gallery of every
block and the fastest way to eyeball a new or changed block in the true render path.

## Programmatic pages

Some pages are generated from data, not hand-authored in Sanity.

- Elections pages under `src/app/elections/**` — a state / county / city / subplace
  hierarchy plus per-office (position) and candidate-list pages, built from
  election-api data. Slugs, county-equivalent naming, MTFCC place classification, and
  template resolution all live in `src/lib/`.
- Candidate pages at `src/app/candidate/[...slug]/page.tsx` — stitch an election-api
  candidacy record together with the claimed campaign from gp-api.

These are the most complex and bug-prone surface. A wrong candidate page is usually
an upstream data problem in gp-api or election-api, not a bug you can fix here. Full
domain model, data sources, and what is and is not fixable in this repo:
`docs/elections.md`.

## Integrations

- **HubSpot** — marketing forms are embedded HubSpot forms (see `src/ui/Form/`).
- **Amplitude** — product analytics plus A/B experiments. `src/middleware.ts`
  bootstraps an Amplitude device cookie on page routes so experiments can be resolved
  server-side. Experiment variants are also modeled as Sanity content
  (`experiment_variant`). The client loads the plain Amplitude SDK plus the
  experiment-only script — never the all-in-one `script/<key>.js` build, which
  bundles session replay capture (see `src/ui/Amplitude.tsx`).
- **AirOps -> Sanity** — AirOps writes content (articles, glossary, landing pages,
  policy) into Sanity via the Editor API, then a Sanity webhook hits
  `POST /api/revalidate` to make it live. Details, auth, and troubleshooting:
  `docs/airops-sanity-integration.md`.

## Deployment

Deployed on Vercel. Branches map to environments: `develop` -> dev, `qa` -> qa,
`master` -> prod. `develop` is the default branch.

Content changes do not need a deploy. When content is published (or written by
AirOps), a Sanity webhook calls `POST /api/revalidate`, which triggers Next.js ISR
revalidation and the change goes live. Code changes go live by merging up the branch
chain and letting Vercel build and deploy.

## Where to look

| You're doing                                   | Read                                |
| ---------------------------------------------- | ----------------------------------- |
| Repo-wide conventions, commands, style         | root `AGENTS.md`                    |
| Deciding if a change is content or code        | `docs/content-vs-code.md`           |
| Adding or changing a page-builder block        | `docs/adding-a-component.md`        |
| Election / candidate programmatic pages        | `docs/elections.md`                 |
| AirOps content pipeline + revalidation webhook | `docs/airops-sanity-integration.md` |

## Keep docs current

These docs are living context. When a change alters how something here works, update
the nearest relevant doc in the same pull request. A change that leaves its doc stale
is incomplete.
