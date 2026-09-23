import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { ElectionsNearYouBlockSection } from './ElectionsNearYouBlockSection.tsx';

/**
 * Pins the schema-vs-GROQ field mapping. The `...` spread in the GROQ fragment
 * projects flat fields under their schema names, so a rename on either side would
 * otherwise render an empty block with no type error (see docs/adding-a-component.md).
 */
const section = {
	_type: 'component_electionsNearYouBlock',
	_key: 'test',
	field_heading: 'Find more elections near you',
	field_body: 'Find upcoming elections in your city or county.',
	field_buttonLabel: 'Search',
	field_backgroundVariant: 'midnight',
	field_showSocialProof: false,
	componentSettings: null,
} as unknown as Parameters<typeof ElectionsNearYouBlockSection>[0];

describe('ElectionsNearYouBlockSection', () => {
	test('renders the heading, body, input, and button from the CMS fields', () => {
		const html = renderToStaticMarkup(<ElectionsNearYouBlockSection {...section} />);

		expect(html).toContain('Find more elections near you');
		expect(html).toContain('Find upcoming elections in your city or county.');
		expect(html).toContain('Enter your city or county');
		expect(html).toContain('Search');
	});

	test('falls back to the default button label when none is set', () => {
		const html = renderToStaticMarkup(<ElectionsNearYouBlockSection {...section} field_buttonLabel={undefined} />);

		expect(html).toContain('Search');
	});
});
