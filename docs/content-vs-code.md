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
- Embeds via the Embedded Block, as long as the provider is one the block supports:
  HubSpot (forms, meetings), YouTube, Vimeo, Calendly, Navattic, VoteAmerica. Any
  other provider's snippet is stripped of scripts for security and usually renders as
  an empty section; supporting it is a code change (see the next section).
  VoteAmerica embeds size themselves to the form and sit inside a padded white card,
  so the block's Height field is only the height shown until the form reports its
  own; leave "Full Page" off for them, since it removes the block's padding and
  the card.
- Election page templates: which blocks appear and the token-driven copy on the
  global template or a per-location custom template. Step-by-step editor guide:
  `docs/election-templates-manual.md`.

Content published in Studio goes live without a rebuild (a webhook revalidates the
affected pages). Content can also be written into Sanity programmatically over the
API, though nothing is doing that today — see `docs/sanity-api-writes.md`.

Studio has content releases turned on (the Releases button in the top bar). A release
bundles many documents, new and edited, so an editor can look through them and publish
them all in one click. Content written over the API in bulk (for example a batch of
state-tagged quotes) should be put in a release rather than left as loose drafts, so it
can be reviewed and published as one unit.

## Code needed — this is a change in this repo

Open a PR (use the `ship-pr` skill) when the request requires any of these:

- A **new block type**. Use the `new-component` skill; the recipe behind it is
  `docs/adding-a-component.md`.
- A **new field or option** on an existing block (for example "add a subtitle
  field" or "add a new background color choice"), or any other change to a block
  that already ships. Use the `update-component` skill, which also works out which
  live pages the change reaches.
- **Styling or responsive behavior** — how a block looks or reflows. Lives in
  `src/ui/` and CSS, not in Studio.
- The **election or candidate pages'** behavior, templates, tokens, or the data they
  pull in. See `docs/elections.md`.
- **SEO plumbing**: sitemaps, canonical tags, structured data / schema, `llms.txt`,
  redirect logic, middleware.
- A **new page route** or a **new document type** in Sanity.
- A **new embed provider** for the Embedded Block. The approved hosts and the
  per-provider parsing live in `src/ui/EmbedHtml.tsx`; script-based snippets need a
  branch that builds the provider's iframe URL, since scripts never run.

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
