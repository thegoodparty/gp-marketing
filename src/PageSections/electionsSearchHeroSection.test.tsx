import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { ElectionsSearchHeroSection } from './ElectionsSearchHeroSection.tsx';

/**
 * Runs the section through GROQ-shaped props. The flat fields flow through the
 * `...` spread under their schema names, and each slide's `ref_quoteBy` is
 * dereferenced by the projection, so a wrong name on either side would render
 * a hero with no slides and no type error (see docs/adding-a-component.md).
 */
type Section = Parameters<typeof ElectionsSearchHeroSection>[0];

const photo = (ref: string) => ({ _type: 'image', asset: { _ref: ref, _type: 'reference' } });

const slide = (key: string, name: string, role: string, quote: string) => ({
	_key: key,
	_type: 'slide',
	img_photo: photo(`image-${key}`),
	field_quote: quote,
	ref_quoteBy: {
		_id: `person-${key}`,
		_type: 'person',
		personOverview: { field_personName: name, field_jobTitleOrRole: role, img_profilePicture: photo(`avatar-${key}`) },
	},
});

const section = {
	_type: 'component_electionsSearchHero',
	_key: 'test',
	electionsSearchHeroContent: {
		field_headerText: 'Find independents on your ballot.',
		field_bodyCopy: 'Explore upcoming elections near you.',
	},
	ctaAction: { field_buttonText: 'Search' },
	list_slides: [
		slide('one', 'Angel Johnston', 'Three Rivers City Mayor', 'Running as an independent changed everything.'),
		slide('two', 'Jordan Reyes', 'School Board Trustee', 'I answered to my neighbors, not a party.'),
	],
	electionsSearchHeroDesignSettings: { field_backgroundColor: 'cream' },
	componentSettings: { field_anchorId: 'hero' },
} as unknown as Section;

describe('ElectionsSearchHeroSection', () => {
	test('renders the heading, body, search input, and button from the CMS fields', () => {
		const html = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} />);

		expect(html).toContain('Find independents on your ballot.');
		expect(html).toContain('Explore upcoming elections near you.');
		expect(html).toContain('Enter your city or county');
		expect(html).toContain('data-component="ElectionsNearYouSearch"');
		expect(html).toContain('id="hero"');
	});

	test('falls back to the default button label when none is set', () => {
		const html = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} ctaAction={undefined} />);

		expect(html).toContain('>Search<');
	});

	test('renders one slide per entry with its quote, name, and title', () => {
		const html = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} />);

		expect(html.match(/aria-roledescription="slide"/g)).toHaveLength(2);
		expect(html).toContain('Running as an independent changed everything.');
		expect(html).toContain('Angel Johnston');
		expect(html).toContain('Three Rivers City Mayor');
		expect(html).toContain('Jordan Reyes');
		expect(html).toContain('School Board Trustee');
	});

	test('skips a slide that has no photo', () => {
		const withoutPhoto = { ...slide('three', 'Sam Okafor', 'County Commissioner', 'No photo here.'), img_photo: null };
		const html = renderToStaticMarkup(
			<ElectionsSearchHeroSection {...section} list_slides={[...(section.list_slides ?? []), withoutPhoto] as unknown as Section['list_slides']} />,
		);

		expect(html.match(/aria-roledescription="slide"/g)).toHaveLength(2);
		expect(html).not.toContain('Sam Okafor');
	});

	test('leaves the carousel out entirely when there are no slides', () => {
		const html = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} list_slides={null} />);

		expect(html).not.toContain('data-component="ElectionsSearchHeroCarousel"');
		expect(html).toContain('Find independents on your ballot.');
		expect(html).toContain('data-component="ElectionsNearYouSearch"');
	});

	test('applies the background colour from the design settings and defaults to midnight without one', () => {
		const cream = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} />);
		const absent = renderToStaticMarkup(<ElectionsSearchHeroSection {...section} electionsSearchHeroDesignSettings={undefined} />);

		expect(cream).toContain('bg-goodparty-cream');
		// The live Elections document predates the redesign and has no cream
		// value saved, so the absent case must keep rendering as midnight.
		expect(absent).toContain('bg-midnight-900');
	});
});
