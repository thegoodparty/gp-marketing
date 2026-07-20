/**
 * Scaffolds a new Sanity page-builder block and wires it into every place the
 * rendering pipeline needs it, so the block cannot half-work silently. Run:
 *
 *   bun run new:component <PascalCaseName> [--group <menuGroup>]
 *
 * Example: bun run new:component PromoBanner --group text
 *
 * It creates the schema, the PageSection wrapper, and the UI component, then edits
 * componentSchema.ts, list_pageSections.ts, groq.ts, and PageSections/index.tsx.
 * After it runs, regenerate types (bun run sanity:extract && bun run sanity:generate)
 * and verify the block on http://localhost:3009/all. See docs/adding-a-component.md.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MENU_GROUPS = ['hero', 'form', 'text', 'image', 'quote', 'cards', 'grid', 'stats', 'pricing', 'features', 'cta', 'blog'];
const DEFAULT_GROUP = 'text';

const root = join(import.meta.dir, '..');

const fail = (message: string): never => {
	console.error(`\n  new:component: ${message}\n`);
	process.exit(1);
};

const args = process.argv.slice(2);
const groupFlagIndex = args.findIndex(a => a === '--group');
const menuGroup = groupFlagIndex >= 0 ? args[groupFlagIndex + 1] : DEFAULT_GROUP;
const rawName = args.find((a, i) => !a.startsWith('--') && (groupFlagIndex < 0 || i !== groupFlagIndex + 1));

if (!rawName) {
	fail('missing name. Usage: bun run new:component <PascalCaseName> [--group text]');
}
if (!/^[A-Z][A-Za-z0-9]+$/.test(rawName!)) {
	fail(`name must be PascalCase letters/numbers (got "${rawName}"). Example: PromoBanner`);
}
if (!MENU_GROUPS.includes(menuGroup!)) {
	fail(`--group must be one of: ${MENU_GROUPS.join(', ')}`);
}

// Naming: PromoBanner -> component_promoBanner, PromoBannerSection, ui/PromoBanner, "Promo Banner"
const reactName = rawName!;
const camel = reactName.charAt(0).toLowerCase() + reactName.slice(1);
const componentType = `component_${camel}`;
const sectionName = `${reactName}Section`;
const title = reactName.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const schemaPath = join(root, 'src/sanity/schema/components', `${componentType}.ts`);
if (existsSync(schemaPath)) {
	fail(`a block named ${componentType} already exists (${schemaPath}). Pick a different name.`);
}

// --- Anchored edit helper: replaces exactly once, or fails loudly if the anchor moved.
const edit = (relPath: string, anchor: string, replacement: string): void => {
	const path = join(root, relPath);
	const src = readFileSync(path, 'utf8');
	if (!src.includes(anchor)) {
		fail(`could not find the expected anchor in ${relPath}. The file may have changed shape; update scripts/new-component.ts.`);
	}
	writeFileSync(path, src.replace(anchor, replacement));
};

const write = (path: string, contents: string): void => writeFileSync(path, contents);

// --- New file: schema
write(
	schemaPath,
	`import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const ${componentType} = {
	title: '${title}',
	name: '${componentType}',
	type: 'object',
	icon: getIcon('Development'),
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
		},
		{
			title: 'Body',
			name: 'field_body',
			type: 'text',
			rows: 4,
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
			title: 'field_heading',
		},
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Development'),
				fallback: {
					title: '${title}',
				},
			};
			const title = resolveValue('title', ${componentType}.preview.select, x);
			const subtitle = resolveValue('subtitle', ${componentType}.preview.select, x);
			const media = resolveValue('media', ${componentType}.preview.select, x);
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
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
`,
);

// --- New file: PageSection wrapper
write(
	join(root, 'src/PageSections', `${sectionName}.tsx`),
	`import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { ${reactName} } from '~/ui/${reactName}';

export function ${sectionName}(section: Extract<Sections, { _type: '${componentType}' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='${title}'>
			<${reactName} heading={section.field_heading ?? ''} body={section.field_body ?? ''} />
		</section>
	);
}
`,
);

// --- New file: UI component (a plain scaffold; restyle it to match the design system)
write(
	join(root, 'src/ui', `${reactName}.tsx`),
	`import { Container } from '~/ui/Container.tsx';
import { Text } from '~/ui/Text.tsx';

export type ${reactName}Props = {
	heading?: string;
	body?: string;
};

export const ${reactName} = (props: ${reactName}Props) => {
	return (
		<section className='py-(--container-padding)'>
			<Container>
				<Text as='h2' styleType='heading-lg'>
					{props.heading}
				</Text>
				<Text as='p' styleType='body-1'>
					{props.body}
				</Text>
			</Container>
		</section>
	);
};
`,
);

// --- Edit: componentSchema.ts (import + array entry)
edit(
	'src/sanity/schema/components/componentSchema.ts',
	'\nexport const componentSchema = [',
	`\nimport { ${componentType} } from './${componentType}.ts';\n\nexport const componentSchema = [\n\t${componentType},`,
);

// --- Edit: list_pageSections.ts (top-level page-sections array + insert-menu group)
edit(
	'src/sanity/schema/lists/list_pageSections.ts',
	"type: 'array',\n  of: [\n",
	`type: 'array',\n  of: [\n    { title: '${title}', type: '${componentType}' },\n`,
);
{
	const path = join(root, 'src/sanity/schema/lists/list_pageSections.ts');
	const src = readFileSync(path, 'utf8');
	const groupsStart = src.indexOf('groups: [');
	const nameIdx = groupsStart >= 0 ? src.indexOf(`name: '${menuGroup}',`, groupsStart) : -1;
	const ofIdx = nameIdx >= 0 ? src.indexOf('of: [', nameIdx) : -1;
	if (ofIdx < 0) {
		fail(`could not find the '${menuGroup}' insert-menu group in list_pageSections.ts.`);
	}
	const insertAt = ofIdx + 'of: ['.length;
	writeFileSync(path, `${src.slice(0, insertAt)}\n            '${componentType}',${src.slice(insertAt)}`);
}

// --- Edit: groq.ts (projection + append to sectionsGroq before its closing backtick)
edit(
	'src/sanity/groq.ts',
	'export const sectionsGroq = `_key,_type,',
	`export const ${componentType} = \`_type=="${componentType}"=>{...,componentSettings}\`;\n/*language=textmate*/\nexport const sectionsGroq = \`_key,_type,`,
);
{
	const path = join(root, 'src/sanity/groq.ts');
	const src = readFileSync(path, 'utf8');
	const lineStart = src.indexOf('export const sectionsGroq = `');
	const lineEnd = src.indexOf('`;', lineStart);
	if (lineStart < 0 || lineEnd < 0) {
		fail('could not find the sectionsGroq template literal in src/sanity/groq.ts.');
	}
	writeFileSync(path, `${src.slice(0, lineEnd)},\${${componentType}}${src.slice(lineEnd)}`);
}

// --- Edit: PageSections/index.tsx (import + switch case)
edit(
	'src/PageSections/index.tsx',
	'export type Sections = ',
	`import { ${sectionName} } from '~/PageSections/${sectionName}';\n\nexport type Sections = `,
);
edit(
	'src/PageSections/index.tsx',
	'\t\t\t\tdefault:',
	`\t\t\t\tcase '${componentType}':\n\t\t\t\t\treturn (\n\t\t\t\t\t\t<ComponentErrorBoundary key={section._key} componentName='${title}'>\n\t\t\t\t\t\t\t<${sectionName} {...section} />\n\t\t\t\t\t\t</ComponentErrorBoundary>\n\t\t\t\t\t);\n\t\t\t\tdefault:`,
);

console.log(`
  Scaffolded ${componentType} ("${title}") and wired it in.

  Created:
    src/sanity/schema/components/${componentType}.ts
    src/PageSections/${sectionName}.tsx
    src/ui/${reactName}.tsx
  Wired into: componentSchema.ts, list_pageSections.ts (page-sections + '${menuGroup}' menu group), groq.ts, PageSections/index.tsx

  Next:
    1. bun run sanity:extract && bun run sanity:generate   # regenerate types
    2. bun run typecheck
    3. bun run dev  ->  add the block to the /all page in Studio  ->  open http://localhost:3009/all
    4. Customize the fields (schema), the mapping (${sectionName}), and the styling (ui/${reactName}) for what you need.
`);
