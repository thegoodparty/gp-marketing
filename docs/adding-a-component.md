# Adding a component (page-builder block)

This is the step-by-step recipe for adding a new "block" to the site so it shows up in the drag-and-drop page editor in Sanity Studio.

## What a block is

A block is a reusable section that a marketer can drag onto a page in the editor. Think of a "Click to call" block, a "Stats" block, or a hero banner. Each block has its own fields (copy, images, colors, buttons) that a marketer fills in, and its own look on the page.

Adding a new block is a code change. It touches several files that must all agree with each other. This is the important thing to understand: the block only works if every file is edited. If you skip one of the edits, the block can still deploy without any error, and it will half-work in a way that is easy to miss. It might not appear in the editor's add-block menu, or it might appear but render nothing, or it might render but pull in no data. So follow every step, and then verify visually (see the verification loop at the end).

Why it fails silently: type and lint errors are caught (CI and the build enforce `typecheck` and `lint`), but most ways to half-wire a block are not type errors. An unknown block type renders as nothing instead of crashing (the render switch just logs a warning), the error boundary swallows render errors, and a missing GROQ projection or a missing add-block-menu entry is perfectly valid TypeScript. So `typecheck`, `lint`, and `test` will pass on a broken block. Verifying visually on `/all` is the only safety net for wiring gaps.

If you are an agent doing this work for a non-technical user, explain what you did and whether it worked in plain language. No jargon. Short sentences. If something needs an engineer (see the last section), say so plainly.

## The files you must edit

For a simple block with flat fields (like Click to call), there are 6 edit sites across 5 files. Some files need more than one edit inside them. Do them in this order.

Throughout, replace `<Name>` with your block's name in PascalCase (for example `ClickToCall`) and `<name>` with camelCase (for example `clickToCall`). The block's internal type name is always `component_<name>Block` (for example `component_clickToCallBlock`).

| #   | File                                                    | What to add                                                                                                                                                                                                                                                                              | What breaks if you skip it                                                                                                                           |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/sanity/schema/components/component_<Name>Block.ts` | Create the block's schema object: `title`, `name` (must equal `component_<name>Block`), `type: 'object'`, `icon`, `fields[]`, `preview`, `groups[]`.                                                                                                                                     | The block does not exist at all. Nothing else can reference it.                                                                                      |
| 2   | `src/sanity/schema/components/componentSchema.ts`       | Two edits in this one file: (a) add an `import` for your new schema; (b) add the schema to the exported `componentSchema` array.                                                                                                                                                         | Studio does not know the block type. It never loads.                                                                                                 |
| 3   | `src/sanity/schema/lists/list_pageSections.ts`          | Two required edits (plus one optional): (a) add `{ title: '...', type: 'component_<name>Block' }` to the top-level `of[]` array; (b) add the `'component_<name>Block'` string to at least one `insertMenu` group bucket. (c) Optional: add a thumbnail URL to the grid-view preview map. | Skip (a): the block is not a valid page section. Skip (b): the block never appears in the editor's add-block menu, so a marketer can never place it. |
| 4   | `src/sanity/groq.ts`                                    | Two edits in this one file: (a) declare an `export const component_<name>Block` query fragment; (b) append `,${component_<name>Block}` to the big `sectionsGroq` template literal at the bottom.                                                                                         | Skip (b): the block renders but fetches no data, so it shows up empty. This is the classic bug.                                                      |
| 5   | `src/PageSections/<Name>BlockSection.tsx`               | Create the React wrapper that maps the CMS field names to the UI component's props.                                                                                                                                                                                                      | The page has no way to turn the block's saved data into something on screen.                                                                         |
| 6   | `src/PageSections/index.tsx`                            | Two edits in this one file: (a) add an `import` for your wrapper; (b) add a `case 'component_<name>Block':` to the `switch` that renders your wrapper inside a `<ComponentErrorBoundary>`.                                                                                               | The block falls through to the default case and renders nothing (with a console warning you will not see in production).                             |

There is also the presentational UI component itself, `src/ui/<Name>Block.tsx`, which is the actual markup and styles. Step 5's wrapper renders this. If your block reuses an existing UI component you may not need a new one. A Storybook stories file (`src/ui/<Name>Block.stories.tsx`) is genuinely optional. Click to call shipped without one.

After all edits, regenerate the Sanity types (see "Regenerate types" below).

## Worked example: the Click to call block

This is the simplest real block. Its fields are all flat (plain text and strings, no nested references or buttons), so it needs almost no GROQ projection. Use it as your template for a simple block.

### 1. The schema (`component_clickToCallBlock.ts`)

Every component schema file starts with the same three imports:

```ts
import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';
```

The schema object itself. Note `type: 'object'`, the `getIcon(...)` icon, the flat `field_*` fields, and the two shared setting objects (`ctaBlockDesignSettings` and `componentSettings`) pulled in at the end:

```ts
export const component_clickToCallBlock = {
	title: 'Click to Call Block',
	name: 'component_clickToCallBlock',
	type: 'object',
	icon: getIcon('Phone'),
	fields: [
		{
			title: 'Pre-framing copy',
			name: 'field_preframingText',
			type: 'text',
			rows: 4,
			validation: (Rule: any) => Rule.required(),
		},
		{
			title: 'Button label',
			name: 'field_buttonText',
			type: 'string',
			initialValue: 'Talk through my race',
			validation: (Rule: any) => Rule.required(),
		},
		// ...more flat field_* fields...
		{
			title: 'Design Settings',
			name: 'ctaBlockDesignSettings',
			type: 'ctaBlockDesignSettings',
			group: 'ctaBlockDesignSettings',
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			type: 'componentSettings',
			group: 'componentSettings',
		},
	],
	preview: {
		select: {
			title: 'field_buttonText',
			subtitle: 'field_phoneNumber',
		},
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Phone'),
				fallback: { title: 'Click to Call Block' },
			};
			const title = resolveValue('title', component_clickToCallBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_clickToCallBlock.preview.select, x);
			const media = resolveValue('media', component_clickToCallBlock.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
	groups: [
		{ title: 'Design Settings', name: 'ctaBlockDesignSettings', icon: getIcon('ColorPalette') },
		{ title: 'Settings', name: 'componentSettings', icon: getIcon('Settings') },
	],
};
```

The `preview.prepare` body is boilerplate. Copy it from an existing block and just change the fallback title and icon.

### 2. Register in `componentSchema.ts`

Add the import at the top with the others, then add the name to the array:

```ts
import { component_clickToCallBlock } from './component_clickToCallBlock.ts';

export const componentSchema = [
	// ...all the other blocks...
	component_clickToCallBlock,
];
```

### 3. Register in `list_pageSections.ts`

This file is the easiest one to half-finish, because there are two separate places to edit.

First, add an entry to the top-level `of[]` array. This is what makes the block a valid page section:

```ts
{
	title: 'Click to Call Block',
	type: 'component_clickToCallBlock',
},
```

Second, add the type string to at least one `insertMenu` group bucket. This is what puts the block in the editor's "add block" menu so a marketer can find it. Click to call is listed in two buckets, `form` and `cta`. Pick whichever bucket(s) fit your block (options include `hero`, `form`, `text`, `image`, `quote`, `cards`, `grid`, `stats`, `pricing`, `features`, `cta`, `blog`):

```ts
{
	name: 'form',
	title: 'Form',
	of: [
		'component_heroWithSubscribe',
		'component_newsletterBlock',
		'component_clickToCallBlock',
	],
},
```

Optional third edit: there is a grid-view preview-image map keyed by block type. Only about 25 blocks have a thumbnail. Click to call does not, so a thumbnail is not required.

### 4. Register in `groq.ts` (the data query)

Two edits, same file. First, declare the query fragment. For a flat-field block the `...` spread grabs every top-level field automatically, so you only name the shared setting objects:

```ts
export const component_clickToCallBlock = `_type=="component_clickToCallBlock"=>{...,ctaBlockDesignSettings,componentSettings}`;
```

Second, and this is the step people forget, append your fragment to the big `sectionsGroq` template literal near the bottom of the file. It is one long comma-joined list:

```ts
export const sectionsGroq = `_key,_type,${component_pricingBlockGroq},/* ...many more... */,${component_clickToCallBlock},${component_teamValuesBlock}`;
```

If you skip this second edit, the block will render its shell but with no content, because the page fetch never asks for its data.

### 5. The wrapper (`ClickToCallBlockSection.tsx`)

This adapts the saved CMS data to the props your UI component expects. The function signature always uses `Extract<Sections, { _type: 'component_<name>Block' }>` so it is fully typed:

```tsx
import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { ClickToCallBlock } from '~/ui/ClickToCallBlock';

export function ClickToCallBlockSection(section: Extract<Sections, { _type: 'component_clickToCallBlock' }>) {
	const backgroundColor = section.ctaBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const color = resolveComponentColor(stegaClean(section.ctaBlockDesignSettings?.field_componentColor6ColorsInverse), backgroundColor);

	const anchorId = section.componentSettings?.field_anchorId;

	return (
		<section data-section='Click to Call Block' id={anchorId ? stegaClean(anchorId)?.trim() || undefined : undefined}>
			<ClickToCallBlock
				preframingText={section.field_preframingText ?? ''}
				buttonText={section.field_buttonText ?? 'Talk through my race'}
				phoneNumberDisplay={section.field_phoneNumber ?? ''}
				backgroundColor={backgroundColor}
				color={color}
			/>
		</section>
	);
}
```

The `resolve*` helpers live in `src/ui/_lib/`. Reuse them; do not reinvent color or background logic.

### 6. Wire the switch (`index.tsx`)

Two edits, same file. Add the import near the other section imports:

```tsx
import { ClickToCallBlockSection } from '~/PageSections/ClickToCallBlockSection';
```

Then add a `case` to the switch. Always wrap in `ComponentErrorBoundary` with a `key` and a human-readable `componentName`:

```tsx
case 'component_clickToCallBlock':
	return (
		<ComponentErrorBoundary key={section._key} componentName='Click to Call Block'>
			<ClickToCallBlockSection {...section} />
		</ComponentErrorBoundary>
	);
```

Some blocks also receive extra props here, such as `tokens={props.tokens}` or a `...Override={props.sectionOverrides?.component_...}`. Copy the pattern from a neighboring case only if your block needs those.

## When you need a GROQ projection

The flat-field case above is the easy one. If your block has nested data (buttons, rich text, or references to other documents), the `...` spread is not enough. You have to project those nested pieces explicitly, or they come back empty.

The Stats block is the contrasting example. It has a nested `summaryInfo` object that carries buttons and rich text, so its fragment projects that object through a shared fragment:

```ts
export const component_statsBlock = `_type=="component_statsBlock"=>{...,summaryInfo{${summaryInfoGroq}}}`;
```

Its wrapper then reads the projected data and uses more `_lib` helpers (`transformButtons`, `resolveStats`, a `<RichData>` component, and so on). If your block has anything beyond flat text and the two shared setting objects, look at Stats block as your model, and expect to write a real projection.

### The GROQ gotcha: schema names vs projected names

This is the single most common source of a silently empty block. The field name in the schema is not always the name you read in the wrapper. A GROQ fragment can rename a field as it projects it.

For example, the CTA block's schema field `ctaMessaging` is projected to the name `overview`, and `ctaAction` is projected to `primaryCTA`. So the wrapper reads `section.overview` and `section.primaryCTA`, not `section.ctaMessaging`. If you write the wrapper against the schema names, it type-checks fine and renders empty.

Rule: when your block uses a projection, read the wrapper's field names off the GROQ fragment, not off the schema. See `.cursor/BUGBOT.md` (the "Sanity Seed vs GROQ Projection" section) and the elections notes for the full explanation, including the separate in-code template path where the raw schema names are used instead.

## Regenerate types

After any schema or GROQ change, regenerate the Sanity types:

```
bun run sanity:extract && bun run sanity:generate
```

This rewrites `sanity.types.ts`. That file is generated and is about 14 MB. Never hand-edit it, and do not open it into an agent's context. If your `Sections` type does not know about your new block, this is the step you missed.

## Verify before opening a PR

Because failures here are silent (type errors are ignored at build time, unknown blocks render as nothing, and error boundaries swallow render crashes), visual and typecheck verification is mandatory. Do not rely on the build passing.

Run this loop:

1. `bun run dev` and open the dev site at `http://localhost:3009`.
2. Add your block to a page in Studio, or view the gallery at `http://localhost:3009/all`. The `/all` page renders every registered block through the real page pipeline, so it is the fastest way to eyeball a new block. Confirm the block appears, shows your content, and looks right.
3. `bun run typecheck`. This runs `tsc --noEmit`. CI and the Vercel build both enforce it, so it must be clean before you open a PR. If a local run looks clean but you are unsure, clear the cache first: `rm -f node_modules/.tsbuildinfo && bun run typecheck`.
4. `bun run test`. Runs the unit and DOM tests.

If the block does not appear in the add-block menu, recheck step 3 (`list_pageSections.ts` insertMenu). If it appears but is empty, recheck the GROQ append (step 4 of the recipe) and the projection names.

## When to ask an engineer

Handle these with an engineer rather than pushing through alone:

- A new field type you have not used before, or anything that changes how data is stored.
- A schema migration, or renaming or removing a field that pages already use.
- Anything that needs heavy GROQ work: new projections through references, dereferenced documents, or shared fragments you are unsure about.
- Elections or candidate-page behavior, token definitions, or API integration.

If you are an agent and you hit one of these, stop and report back in plain language what you were trying to do and where you got stuck. Do not guess at a schema migration.
