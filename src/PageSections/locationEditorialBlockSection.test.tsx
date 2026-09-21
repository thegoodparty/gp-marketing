import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { LocationEditorialBlockSection } from './LocationEditorialBlockSection.tsx';

/**
 * These assert the field mapping, which is the half of this block that fails
 * silently: the schema names and the GROQ-projected names have to agree, and a
 * wrong one reads as `undefined` rather than as a type error (see the GROQ
 * gotcha in `docs/elections.md`).
 */
const section = {
	_type: 'component_locationEditorialBlock',
	_key: 'test',
	locationEditorialBlockHeader: { field_title: 'More about [location]' },
	locationEditorialBlockContent: {
		block_summaryText: [
			{
				_type: 'block',
				_key: 'a',
				style: 'normal',
				children: [{ _type: 'span', _key: 'a1', text: 'Authored fallback copy.', marks: [] }],
			},
		],
	},
	locationEditorialBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
} as unknown as Parameters<typeof LocationEditorialBlockSection>[0];

describe('LocationEditorialBlockSection', () => {
	test('renders the CMS heading and body, with location tokens resolved', () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlockSection {...section} tokens={{ '[location]': 'Tucson' }} />,
		);

		expect(html).toContain('More about Tucson');
		expect(html).toContain('Authored fallback copy.');
	});

	test("the page's own paragraphs replace the CMS body", () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlockSection
				{...section}
				tokens={{ '[location]': 'Tucson' }}
				editorialOverride={{ paragraphs: ['Per-location copy.'] }}
			/>,
		);

		expect(html).toContain('Per-location copy.');
		expect(html).not.toContain('Authored fallback copy.');
	});

	test("the page's own heading replaces the CMS heading", () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlockSection
				{...section}
				tokens={{ '[location]': 'Tucson' }}
				editorialOverride={{ heading: 'More about Pima County' }}
			/>,
		);

		expect(html).toContain('More about Pima County');
		expect(html).not.toContain('More about Tucson');
	});

	test('renders nothing when neither the page nor the CMS has copy', () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlockSection {...section} locationEditorialBlockContent={null} tokens={{ '[location]': 'Tucson' }} />,
		);

		expect(html).not.toContain('More about Tucson');
	});

	test('honours the hidden flag', () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlockSection {...section} editorialOverride={{ hidden: true }} />,
		);

		expect(html).toBe('');
	});
});
