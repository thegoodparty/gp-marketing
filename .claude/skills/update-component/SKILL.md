---
name: update-component
description: Change an existing Sanity page-builder block after design or copy feedback (a revised Figma frame, a new field or option, a layout, size or colour fix, a behaviour change). Use when the user wants to update, revise, tweak, restyle or fix a block that already exists, including the election redesign blocks that are merged on develop or parked in draft PRs. Finds where the block's code and its live placements are, makes the change in the right branch, verifies it, and parks or ships the PR per the draft-and-batch rule.
---

# Update an existing page-builder block

Use this when a block already exists and needs to change. If the block does not exist
yet, use the `new-component` skill instead. If the request is really a content edit, it
needs no code at all; the first step below checks that.

The person you are helping is usually not an engineer. They will describe the change
the way a designer or editor would ("the stat cards should sit under the copy on
mobile", "add a toggle to hide the callout"). You find the code, make the change, and
verify it. Mechanics of a block (the files, GROQ, types) are in
`docs/adding-a-component.md`; the election batch's decisions and rules are in
`docs/election-redesign-components.md`. This skill does not repeat those. It owns the
part that is specific to changing something that already ships: finding the right
branch, knowing who is affected, and not breaking pages that already carry the block.

## What to get from the requester

Collect these before touching code. Ask for what is missing in one message, in plain
language, and say which ones you can live without.

1. **Which block.** The spreadsheet or Studio name is enough; you map it to the
   `component_*` type. If the same name could mean two blocks (the two testimonial
   blocks, the two search blocks), confirm which.
2. **What changes, as a list.** One line per change, ideally "was X, should be Y". A
   revised Figma frame on its own is not enough, because frames also carry things that
   were never meant to change (placeholder copy, a stale colour), and you cannot tell
   the intended delta from the accidental one.
3. **The frames.** The revised desktop and mobile frames, as links with a `node-id`.
   If only one side changed, say so. If the old frames are still the reference for the
   parts that did not change, say that too.
4. **What kind of change it is**, if they know: look only (spacing, size, colour,
   layout), editor controls (a new field, option or toggle), behaviour (what shows
   when), or data (a new figure or list from election-api). Mixed is fine. This
   decides whether the change touches the schema, the override wiring, or just the UI.
5. **Where it should go live.** With the rest of its page's batch (the default for
   anything on a live template), or on its own now. And whether this block already has
   a draft PR waiting (you will check, but they often know).
6. **Decisions already made.** Anything settled with design or the team that the frame
   does not show, with who and when, so the doc can record it. In particular, for a new
   field or option: what pages that already carry the block should render, since they
   have no value for it.
7. **For data changes only:** what the figure or list means exactly (the counts
   section of the redesign doc shows the level of precision needed) and what to show
   when there is no data. Hide, show zero, and show a placeholder are three different
   answers.

## Step 1: Is this code at all?

Read `docs/content-vs-code.md`. Copy, images, links, a colour that is already a Design
Settings dropdown, a toggle that already exists, adding or reordering blocks on a
template: these are Studio edits. Say so plainly, point at the field, and stop. Design
feedback rounds mix the two freely, so expect to split a list into "you can do these in
Studio today" and "these need code".

## Step 2: Find where the block's code lives right now

A block in this batch can be in three places at once, and the change has to land in the
most downstream one or two PRs will fight over the same file.

```bash
git fetch -q origin
# Is the block on develop?
git ls-tree --name-only origin/develop src/sanity/schema/components/ | grep -i <name>
# Does an open PR already change it?  (drafts included)
gh pr list --repo thegoodparty/gp-marketing --state open --limit 60 \
  --json number,title,isDraft,headRefName,baseRefName \
  --jq '.[] | "\(.number)\tdraft=\(.isDraft)\t\(.headRefName) -> \(.baseRefName)\t\(.title)"'
gh pr view <n> --repo thegoodparty/gp-marketing --json files --jq '.files[].path' | grep -i <name>
```

Then:

- **Only on develop, no open PR touches it** → branch from `origin/develop` as usual.
- **An open draft PR already redesigns it** → work on that PR's branch. Do not open a
  second PR for the same block; the draft is where its next release lives, and a
  second branch would conflict with it the moment either merges. Several of these
  drafts are far behind `develop` (check with
  `git rev-list --count origin/<branch>..origin/develop`) and some are marked
  CONFLICTING. Bring `develop` into the branch first with a merge (the branch is
  shared, so never rebase it), resolve, get it green, and only then make the change.
  Doing it in that order keeps the design change reviewable as its own commit.
- **The PR is stacked** (its base is another PR's branch, for example the position
  content block on the position hero) → a change to the lower block goes on the lower
  branch, then merge that branch up into the stacked one so both stay consistent.
  A change to the upper block goes on the upper branch only.
- **Stacked on a branch that has since merged** → the base is stale; `gh pr edit <n>
  --base develop` and merge `develop` in before anything else.

Say which case you are in before you start, in one sentence.

## Step 3: Find out who is affected

This decides whether the PR can merge or must wait, and it is the fact most often
assumed instead of checked. Run it; do not go by the redesign doc's notes, which go
stale as editors place blocks.

Use the Sanity MCP `query_documents` tool (project `3rbseux7`, dataset `production`)
and run it **twice**, once with perspective `published` and once with `drafts`:

```groq
*[count(pageSections.list_pageSections[_type == $type]) > 0]{
  _id, _type,
  "title": coalesce(field_title, detailPageOverviewNoHero.field_slug, _id),
  field_electionTemplateType, field_enabled
} | order(_type, title)
```

with `params` `{"type": "component_<name>"}`. The sections live at
`pageSections.list_pageSections`, not `pageSections`; the shorter path silently
returns nothing. Ignore `tmpl_*` and `experiment_variant` rows (legacy and A/B data).

Read the result as blast radius:

- **A `goodpartyOrg_globalTemplate` row** (Location - State / County / City /
  District, Location Index, Position Page, Position Candidates, Person Profile): the
  change reaches every page in that family the moment it deploys, thousands at once,
  with nothing to stage behind. This is the **draft-and-batch** case from the redesign
  doc.
- **A `goodpartyOrg_customTemplate` row**: a template that overrides the global for a
  targeted set of pages. It only matters when `field_enabled` is true; the disabled
  person-profile scaffolds show up here and do not count.
- **`goodpartyOrg_landingPages` rows**: named pages. Small radius; list them in the PR
  so a human can eyeball the Vercel preview of each.
- **Only `goodpartyOrg_allComponents`, or nothing at all**: no voter sees it until an
  editor places it. The PR can merge on its own once green.
- **A hit only under `drafts`**: an editor has staged the block onto that template.
  Publishing their draft will make your change live on that family. Treat it as the
  template case for shipping purposes, and tell them, because they may be waiting for
  your change before publishing or may not know it is coming.

Record what you found in the PR body under "What changes on the live site". The
redesign doc also keeps a dated placement snapshot; update it if yours disagrees.

## Step 4: Pin down the delta against what is built

Pull the revised frames with the Figma MCP (`get_design_context` for structure and
tokens, `get_screenshot` to see it) and open the block's Storybook story. Storybook is
`bun run sb:dev` on port 6006; to boot it through `preview_start`, give the worktree a
`.claude/launch.json` (it is gitignored, so recreate it per worktree):

```json
{ "version": "0.0.1", "configurations": [
  { "name": "storybook", "runtimeExecutable": "bun", "runtimeArgs": ["run", "sb:dev"], "port": 6006 }
] }
```

The story renders alone at
`http://localhost:6006/iframe.html?id=<story-id>--default&viewMode=story`, where
`<story-id>` is the story file's full `title` lower-cased with every `/` and space turned
into `-`. The hierarchy is part of the id, and the blocks are split across two: the
election batch uses `New Components/Page Sections/Nearby Offices` →
`new-components-page-sections-nearby-offices`, while older blocks use
`Page Sections/Banner Block` → `page-sections-banner-block`. Read the `title` line in
`src/ui/<Name>.stories.tsx` rather than guessing the prefix; a wrong one is a blank page,
not an error. If the story exports something other than `Default`, use that export's name
in kebab case after the `--`. Put the frame and the story side by side and write the
change list in your own words: what moves, what appears, what is removed, which sizes and
colours differ.

Then reconcile it with the requester's list. Three kinds of mismatch come up every
round:

- **The frame shows a change they did not mention.** Ask before building it. Frames
  carry stale copy, placeholder artwork and unrelated tweaks; the redesign doc's
  "Noted and not acted on" entries are this exact case.
- **They mention a change the frame does not show.** Their words win; the frame is
  probably old. Say so.
- **The frame disagrees with the live scale** (1280 content width, fixed 18px body,
  heading sizes no token gives). The live scale wins; see the settled decisions in the
  redesign doc and measure the current story so you know what "matches" means here.

Decide the kind of change now: UI only, schema (field or option), override wiring
(new data), or a mix. Each has its own traps below.

## Step 5: Make the change

Follow `docs/adding-a-component.md` for the mechanics. These are the extra rules for a
block that already ships:

**Adding a field or option.** Documents saved before the field existed have no value,
so `initialValue` in the schema does not reach them. The *component's* fallback is what
every existing page renders, and it must equal what those pages render today unless the
requester explicitly wants the default to change. Pin the absent case in a test (the
Elections Near You layout field is the model). Regenerate types after the schema edit.

**Renaming or removing a field.** Existing documents still carry the old data. Studio
shows it as an unknown field with a remove button, the GROQ projection and the section
wrapper both have to change, and a page can render empty with no type error if the
wrapper still reads the old name. Removing a field that live pages depend on is
"ask an engineer" territory in the adding doc; at minimum, say in the PR what editors
will see.

**Changing text sizes.** A size token the frames need that does not exist must be
added to `typography.css` *and* to the font-size list in `src/ui/_lib/utils.ts`, or
tailwind-merge silently drops it as a colour. `typeScaleMerge.test.ts` guards the drift.
Verify a size with a computed-style read, never by the class you wrote.

**Needing new data.** Extend the block's `SectionOverrides` entry and the route's
override builder in `src/lib/electionsTemplateHelpers.tsx`, and decide the empty state
deliberately (render nothing versus zero). The redesign doc's "two kinds of block"
section has the four-step wiring. If election-api does not expose the data yet, build
the seam and the honest interim state, and say in the PR what is waiting on which data.

**Tests that pin the old behaviour.** Some will fail on purpose. Read each failure
before changing the assertion: the test may be guarding a decision from an earlier
round (an empty-state rule, a cap, an ordering) that this feedback did not revisit. If
it did revisit it, update the test and the doc entry together.

**The block's own documentation.** Update the story (`src/ui/<Name>.stories.tsx`) so it
shows the new look, and the `.mdx` if it has one. Add the decision to the block's
audit entry in `docs/election-redesign-components.md`, dated, with who settled it, the
way the existing entries do. If the look changed materially, the Studio thumbnail in
`list_pageSections.ts` is now wrong; recapture it the way the `new-component` skill
describes, and ask before uploading to Sanity.

**Scope.** Change what the feedback asked for. A revised frame is not a licence to
redo neighbouring parts of the block, and on a template block every extra change is
also live on thousands of pages.

## Step 6: Verify

The repo fails quietly, so all of these, every time:

```bash
rm -f node_modules/.tsbuildinfo
bun run typecheck
bun run lint
bun run test
```

Then look at it:

- The block's Storybook story at phone width (390) and at 1440, measuring the
  elements the feedback was about with `getBoundingClientRect` and computed styles,
  not by eye on a scaled screenshot.
- `http://localhost:3009/all` if the block is placed there (most election blocks are
  not).
- For a block on a live template, a real page on the PR's Vercel preview once it
  builds: the preview has an election-api token, so it renders the override data that
  local does not. Pick a page in each affected family (a state, a county, a city; or a
  position in each hero state) and check the thing that changed.
- If you touched the schema, open Studio against the branch and confirm an existing
  document still loads the block without an unknown-field warning you did not intend.

## Step 7: Ship, then park or release

Open the PR with the `ship-pr` skill. Then apply what Step 3 told you:

- **On a live global template** → once green and approved, `gh pr ready <n> --undo` to
  convert it to a draft, and say in the body which page batch it waits on. Do not
  leave it in the merge queue.
- **Already a draft PR you pushed to** → it stays a draft. Add a dated "Revisions"
  section to its body listing what this round changed, so the eventual release PR can
  describe the whole block. Re-request the delegate review if the PR body or scope
  changed meaningfully.
- **Named landing pages only** → list them in the body and leave it ready to merge;
  a human decides.
- **Not placed anywhere** → ready to merge. If a *draft* template places it, say so
  in the body and tell the requester which editor's draft will carry it live.

## Reporting back

Plain language, four lines: what changed in the block, where it is live today and
what that means for timing, whether it is waiting as a draft or ready to merge, and
anything you noticed in the frame that you did not build and why. If some of the
feedback turned out to be Studio edits, say which and where the field is.

## Kickoff prompt

```
We're revising page sections for the election location and position page redesign
after a round of design feedback. Read docs/election-redesign-components.md, then the
update-component skill.

Block: [spreadsheet or Studio name]
Changes:
  - [was X, should be Y]
  - [...]
Figma desktop: [link with node-id]   Figma mobile: [link with node-id]
Kind of change: [look / editor controls / behaviour / data / mixed]
Ship: [with the page batch / on its own]
Decisions already made: [who, when, what]

Start by telling me where this block's code and live placements are, and what you'll
change, before building anything.
```
