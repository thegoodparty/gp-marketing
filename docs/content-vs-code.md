# Content vs code: what needs a PR and what does not

Most requests on the marketing site are **content edits** that the marketing team
can make themselves in Sanity Studio, with no code and no deploy. Only some
requests need a code change in this repo. Before you write any code, decide which
kind of request you are looking at, and if it is a content edit, tell the person how
to do it themselves (or offer to walk them through it) instead of opening a PR.

The rule of thumb:

> **Content inside an existing block is Sanity. Changing what a block is, or how it
> behaves, is code.**

## No code needed — this is a Sanity Studio edit

If the request is any of these, it is a content change. Point the person to Sanity
Studio (the CMS, served at `/studio/main`), do not open a PR:

- Editing copy, headings, images, links, button labels, or choosing among the
  options a block already exposes (its colors, layout toggles, etc.).
- Building or rearranging a page: adding, removing, reordering blocks on a landing
  page or the home page using the drag-and-drop builder.
- Blog articles, categories, tags; glossary / political terms; FAQs; policy pages;
  pricing plans; team members; quotes and testimonials.
- Global content: the navigation menu, footer, social links, SEO settings, the 404
  page.
- Redirects (managed as content; they take effect without a deploy).
- A/B experiment variants.
- Election page templates: which blocks appear and the token-driven copy on the
  global template or a per-location custom template.

Content published in Studio goes live without a rebuild (a webhook revalidates the
affected pages). Some content is also written programmatically by AirOps — see
`docs/airops-sanity-integration.md`.

## Code needed — this is a change in this repo

Open a PR (use the `ship-pr` skill) when the request requires any of these:

- A **new block type**, or a **new field or option** on an existing block (for
  example "add a subtitle field" or "add a new background color choice"). See
  `docs/adding-a-component.md`.
- **Styling or responsive behavior** — how a block looks or reflows. Lives in
  `src/ui/` and CSS, not in Studio.
- The **election or candidate pages'** behavior, templates, tokens, or the data they
  pull in. See `docs/elections.md`.
- **SEO plumbing**: sitemaps, canonical tags, structured data / schema, `llms.txt`,
  redirect logic, middleware.
- A **new page route** or a **new document type** in Sanity.

## Not a marketing-site change at all

Some requests look like site bugs but are actually data problems in other systems.
The most common: "this candidate's profile page is wrong / missing / shows the wrong
info." That is almost always a data-lineage issue (how a product account links to a
HubSpot company and a Candidacy record across gp-api, election-api, and HubSpot), not
something you can fix in this repo. Explain that plainly to the person and route it
to an engineer or support. Details in `docs/elections.md`.

## When you are not sure

If you cannot tell whether a request is content or code, the quickest check is to
look at whether the thing being changed is a value inside a block's Sanity schema
(content) or the block's structure/behavior/styling (code). When still unsure, say
so to the person and offer both paths rather than guessing.
