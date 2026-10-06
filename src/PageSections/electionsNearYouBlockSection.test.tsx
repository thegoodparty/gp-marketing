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
	field_layoutVariant: 'contained',
	field_showSocialProof: false,
	field_socialProofText: '13,000+ independents won with GoodParty.org',
	list_Choose3People: null,
	componentSettings: null,
} as unknown as Parameters<typeof ElectionsNearYouBlockSection>[0];

const people = [
	{ _id: 'person-1', personOverview: { img_profilePicture: { _type: 'image', asset: { _ref: 'image-a' } } } },
	{ _id: 'person-2', personOverview: { img_profilePicture: { _type: 'image', asset: { _ref: 'image-b' } } } },
	{ _id: 'person-3', personOverview: { img_profilePicture: { _type: 'image', asset: { _ref: 'image-c' } } } },
] as unknown as NonNullable<Parameters<typeof ElectionsNearYouBlockSection>[0]['list_Choose3People']>;

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

	test('renders the contained card by default and full width when the layout field says so', () => {
		const contained = renderToStaticMarkup(<ElectionsNearYouBlockSection {...section} field_layoutVariant={undefined} />);
		const fullWidth = renderToStaticMarkup(<ElectionsNearYouBlockSection {...section} field_layoutVariant='fullWidth' />);

		// A document saved before the layout field existed has no value, so the
		// absent case must still be the rounded card it renders as today.
		expect(contained).toContain('data-layout="contained"');
		expect(contained).toContain('rounded-3xl');
		expect(fullWidth).toContain('data-layout="fullWidth"');
		expect(fullWidth).not.toContain('rounded-3xl');
	});

	test('hides the social proof row until the toggle is on', () => {
		const html = renderToStaticMarkup(<ElectionsNearYouBlockSection {...section} list_Choose3People={people} />);

		expect(html).not.toContain('13,000+ independents won with GoodParty.org');
	});

	test('renders the social proof text and one avatar per person when the toggle is on', () => {
		const html = renderToStaticMarkup(
			<ElectionsNearYouBlockSection {...section} field_showSocialProof={true} list_Choose3People={people} />,
		);

		expect(html).toContain('13,000+ independents won with GoodParty.org');
		expect(html.match(/data-component="Avatar"/g)).toHaveLength(3);
	});

	test('stays hidden when the toggle is on but nothing has been authored', () => {
		const html = renderToStaticMarkup(
			<ElectionsNearYouBlockSection {...section} field_showSocialProof={true} field_socialProofText={undefined} />,
		);

		expect(html).not.toContain('data-component="Avatar"');
	});
});
