---
name: new-component
description: Add a new Sanity page-builder block (a reusable section the marketing team can drag onto pages). Use when the user wants a new component, block, or section type on the marketing site that does not already exist. Runs the scaffolding generator so no wiring is missed, then customizes and verifies it.
---

# Add a new page-builder block

Use this when the marketing site needs a new kind of block that does not exist yet
(a new section a marketer can drop onto a page in Studio). If the request is really
about content, styling an existing block, or a new field on an existing block, this
is the wrong tool — check `docs/content-vs-code.md` first.

The person you are helping is usually not an engineer. Gather what they want in
plain language, do the technical work yourself, and verify before you open a PR.
Full background: `docs/adding-a-component.md`.

## Why use the generator

Adding a block by hand means editing five files that must all agree, and if you miss
one the block half-works silently (renders nothing, or has no data, or never appears
in the editor menu). The generator does all that wiring in one step so it cannot be
missed. Your job is then the parts that need judgment: the fields, the data mapping,
and the styling.

## Steps

1. **Understand what the block should be.** Ask the person, in plain terms, what it
   should show and roughly how it should look. Pick a PascalCase name (for example
   `PromoBanner`) and, if you know it, which add-block menu group it belongs in
   (`hero`, `form`, `text`, `image`, `quote`, `cards`, `grid`, `stats`, `pricing`,
   `features`, `cta`, `blog`; default is `text`).

2. **Scaffold it:**

   ```bash
   bun run new:component PromoBanner --group text
   ```

   This creates the schema, the PageSection wrapper, and the UI component, and wires
   the block into `componentSchema.ts`, `list_pageSections.ts`, `groq.ts`, and
   `PageSections/index.tsx`. The scaffold is a working placeholder with a heading and
   a body field.

3. **Regenerate types:**

   ```bash
   bun run sanity:extract && bun run sanity:generate
   ```

4. **Customize the three generated files** for what the person actually asked for:
   - `src/sanity/schema/components/component_<name>.ts` — the editable fields.
   - `src/PageSections/<Name>Section.tsx` — maps the Sanity fields to the UI props.
   - `src/ui/<Name>.tsx` — the actual markup and styling. Follow the design system
     (reuse existing components, design tokens, and CSS custom properties; see
     `.cursor/BUGBOT.md`).
   - If you add fields with nested references, buttons, or rich text, you also need a
     GROQ projection — see the GROQ section in `docs/adding-a-component.md`. If you
     add or change fields, regenerate types again (step 3).

5. **Verify (required — this repo fails quietly):**
   - `rm -f node_modules/.tsbuildinfo && bun run typecheck` (must be clean)
   - `bun run test`
   - `bun run dev`, add the block to the `/all` page in Studio, and open
     `http://localhost:3009/all` to confirm it renders with your content and looks
     right. Visual confirmation is the only thing that catches a wiring or data gap,
     because none of those are type errors.

6. **Ship it** with the `ship-pr` skill. Tell the person, in plain language, what the
   new block does and that it will show up in the page builder once the PR merges.

## If the generator errors

It edits real files by matching anchors in them. If it reports it "could not find an
anchor," those files have changed shape since the generator was written. Do not force
it — fall back to the manual recipe in `docs/adding-a-component.md` and update
`scripts/new-component.ts` so the next run works.
