import { beforeAll, describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IllustratedColumnsBlockSection, resolveIllustratedColumns } from './IllustratedColumnsBlockSection.tsx';

// The JSDOM-backed tests in this suite put `window` on globalThis and close it
// afterwards without removing it. `next/image` then sees a window with no
// location and throws mid-render, so this file renders server-side with the
// leftover cleared, the way a real render has no window at all.
beforeAll(() => {
	delete (globalThis as { window?: unknown }).window;
});

/**
 * Runs the section through GROQ-shaped props. The column fields flow through the
 * `...` spread under their schema names, but each column's link is projected by
 * `buttonGroq` (`action`, `text`, `field_externalLink`, ...), so a wrong name on
 * either side renders a column with no link and no type error.
 */
const column = (key: string, title: string, description: string, linkText: string, href: string) => ({
	_key: key,
	_type: 'illustratedColumn',
	img_image: {
		_type: 'img_image',
		alt: `${title} illustration`,
		asset: { _ref: 'image-0123456789abcdef0123456789abcdef01234567-112x112-png', _type: 'reference' },
	},
	field_title: title,
	field_description: description,
	button: {
		_key: `${key}-link`,
		action: 'External',
		hierarchy: 'Secondary',
		text: linkText,
		field_externalLink: href,
	},
});

const section = {
	_type: 'component_illustratedColumnsBlock',
	_key: 'test',
	summaryInfo: {
		field_title: "Are you ready for [Location]'s next election?",
		block_summaryText: [
			{
				_type: 'block',
				_key: 'intro',
				style: 'normal',
				children: [{ _type: 'span', _key: 'intro-span', text: 'Get registered and ready to vote in [Location].', marks: [] }],
				markDefs: [],
			},
		],
		field_textSize: 'Medium',
	},
	list_illustratedColumns: [
		column('registration', 'Check your voter registration', 'Check your registration in under a minute.', 'Check my registration', 'https://vote.gov'),
		column('polling', 'Find your polling location', 'Learn where to go to vote in person.', 'Find my polling place', 'https://www.vote.org/polling-place-locator/'),
		column('mail', 'Request a mail-in ballot', 'Apply for an absentee ballot in [Location].', 'Request my ballot', 'https://www.vote.org/absentee-ballot/'),
	],
	illustratedColumnsBlockDesignSettings: { field_columnLayout234Columns: '3Col', field_blockColorCreamMidnight: 'Cream' },
	componentSettings: { field_anchorId: 'get-ready' },
} as unknown as Parameters<typeof IllustratedColumnsBlockSection>[0];

const tokens = { '[Location]': 'Harris County' };

describe('IllustratedColumnsBlockSection', () => {
	test('renders the header and every column from the CMS fields, with location tokens resolved', () => {
		const html = renderToStaticMarkup(<IllustratedColumnsBlockSection {...section} tokens={tokens} />);

		expect(html).toContain('Are you ready for Harris County&#x27;s next election?');
		expect(html).toContain('Get registered and ready to vote in Harris County.');
		expect(html).toContain('Check your voter registration');
		expect(html).toContain('Find your polling location');
		expect(html).toContain('Request a mail-in ballot');
		expect(html).toContain('Apply for an absentee ballot in Harris County.');
		expect(html).toContain('href="https://vote.gov"');
		expect(html).toContain('Request my ballot');
		expect(html).toContain('alt="Check your voter registration illustration"');
		expect(html).toContain('id="get-ready"');
		expect(html.match(/data-component="IllustratedColumn"/g)).toHaveLength(3);
	});

	test('the Studio column layout drives the row width, and three is the default', () => {
		const three = renderToStaticMarkup(<IllustratedColumnsBlockSection {...section} />);
		const two = renderToStaticMarkup(
			<IllustratedColumnsBlockSection
				{...section}
				illustratedColumnsBlockDesignSettings={{ field_columnLayout234Columns: '2Col', field_blockColorCreamMidnight: 'Cream' }}
			/>,
		);
		const absent = renderToStaticMarkup(<IllustratedColumnsBlockSection {...section} illustratedColumnsBlockDesignSettings={undefined} />);

		expect(three).toContain('data-columns="3"');
		expect(three).toContain('lg:grid-cols-3');
		expect(two).toContain('data-columns="2"');
		expect(two).toContain('md:grid-cols-2');
		expect(absent).toContain('data-columns="3"');

		expect(resolveIllustratedColumns('4Col')).toBe('4');
		expect(resolveIllustratedColumns(undefined)).toBe('3');
	});

	test('switches to the midnight background from the design settings', () => {
		const html = renderToStaticMarkup(
			<IllustratedColumnsBlockSection
				{...section}
				illustratedColumnsBlockDesignSettings={{ field_columnLayout234Columns: '3Col', field_blockColorCreamMidnight: 'MidnightDark' }}
			/>,
		);

		expect(html).toContain('bg-midnight-900');
	});

	test('a column without a link renders its text and no anchor for it', () => {
		const withoutLink = { ...column('registration', 'Check your voter registration', 'Under a minute.', 'Check my registration', 'https://vote.gov'), button: null };
		const polling = column('polling', 'Find your polling location', 'Where to vote in person.', 'Find my polling place', 'https://www.vote.org/polling-place-locator/');
		const html = renderToStaticMarkup(
			<IllustratedColumnsBlockSection
				{...section}
				list_illustratedColumns={[withoutLink, polling] as unknown as NonNullable<typeof section.list_illustratedColumns>}
			/>,
		);

		expect(html).toContain('Check your voter registration');
		expect(html).not.toContain('Check my registration');
		expect(html).toContain('Find my polling place');
	});

	test('renders nothing at all when there are no columns', () => {
		expect(renderToStaticMarkup(<IllustratedColumnsBlockSection {...section} list_illustratedColumns={[]} />)).not.toContain(
			'data-component="IllustratedColumnsBlock"',
		);
		expect(renderToStaticMarkup(<IllustratedColumnsBlockSection {...section} list_illustratedColumns={null} />)).not.toContain(
			'data-component="IllustratedColumnsBlock"',
		);
	});
});
