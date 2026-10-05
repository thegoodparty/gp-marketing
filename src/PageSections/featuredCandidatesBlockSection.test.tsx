import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FeaturedCandidatesBlockSection, resolveFeaturedPeopleMode } from './FeaturedCandidatesBlockSection.tsx';
import type { FeaturedPersonCard } from '~/lib/featuredPeople';

/**
 * Runs the section through GROQ-shaped props. The schema names and the
 * projected names have to agree, and a wrong one reads as `undefined` rather
 * than as a type error.
 */
const section = {
	_type: 'component_featuredCandidatesBlock',
	_key: 'test',
	field_heading: 'Featured people in [location]',
	featuredCandidatesBlockCallout: {
		field_showCallout: true,
		block_calloutText: [
			{
				_type: 'block',
				_key: 'callout',
				style: 'normal',
				children: [{ _type: 'span', _key: 'callout-span', text: 'The badge marks people who signed the pledge in [location].', marks: [] }],
				markDefs: [],
			},
		],
	},
	featuredCandidatesBlockDesignSettings: { field_featuredPeople: 'both', field_blockColorCreamMidnight: 'cream' },
	componentSettings: { field_anchorId: 'featured' },
} as unknown as Parameters<typeof FeaturedCandidatesBlockSection>[0];

const person = (i: number, overrides: Partial<FeaturedPersonCard> = {}): FeaturedPersonCard => ({
	personId: `person-${i}`,
	name: `Person ${i}`,
	office: 'Mayor',
	location: 'Houston, TX',
	href: `/people/person-${i}`,
	avatarUrl: null,
	isPledged: false,
	isNonpartisan: true,
	role: 'candidate',
	electionDate: '2026-11-03',
	...overrides,
});

const featuredOverride = {
	candidates: [person(1, { isPledged: true, avatarUrl: 'https://img.example/1.jpg' }), person(2, { isNonpartisan: false })],
	representatives: [person(3, { role: 'representative', electionDate: null, office: 'Council Member' })],
};

const tokens = { '[location]': 'Houston' };

describe('FeaturedCandidatesBlockSection', () => {
	test('renders the heading, the callout and one card per person, pledged first, with tokens resolved', () => {
		const html = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} tokens={tokens} featuredOverride={featuredOverride} />);

		expect(html).toContain('id="featured"');
		expect(html).toContain('Featured people in Houston');
		expect(html).toContain('The badge marks people who signed the pledge in Houston.');
		expect(html.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(3);
		expect(html.indexOf('Person 1')).toBeLessThan(html.indexOf('Person 3'));
		expect(html.indexOf('Person 3')).toBeLessThan(html.indexOf('Person 2'));
		expect(html).toContain('href="/people/person-1"');
		expect(html).toContain('Council Member');
		expect(html).toContain('Has taken the GoodParty.org Pledge');
		expect(html).toContain('https://img.example/1.jpg');
	});

	/** The location hero's seeded "See who's an independent" button jumps to #independents, so the block answers to it unless an editor picked another id. */
	test('answers to the independents anchor when no anchor id is set', () => {
		const html = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} componentSettings={null} featuredOverride={featuredOverride} />);
		expect(html).toContain('id="independents"');

		const custom = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} featuredOverride={featuredOverride} />);
		expect(custom).toContain('id="featured"');
	});

	test('renders nothing at all, not even the section wrapper, when the page supplies nobody', () => {
		expect(renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} tokens={tokens} />)).toBe('');
		expect(renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} featuredOverride={{ candidates: [], representatives: [] }} />)).toBe('');
	});

	test('the Studio setting picks candidates or representatives only', () => {
		const candidatesOnly = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection
				{...section}
				featuredCandidatesBlockDesignSettings={{ field_featuredPeople: 'candidates' }}
				featuredOverride={featuredOverride}
			/>,
		);
		const representativesOnly = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection
				{...section}
				featuredCandidatesBlockDesignSettings={{ field_featuredPeople: 'representatives' }}
				featuredOverride={featuredOverride}
			/>,
		);

		expect(candidatesOnly.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(2);
		expect(candidatesOnly).not.toContain('Person 3');
		expect(representativesOnly.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(1);
		expect(representativesOnly).toContain('Person 3');
	});

	test('falls back to the default heading and callout copy, and hides the callout when switched off', () => {
		const defaults = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...section} field_heading={undefined} featuredCandidatesBlockCallout={{ field_showCallout: true, block_calloutText: null }} featuredOverride={featuredOverride} />,
		);
		const hidden = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...section} featuredCandidatesBlockCallout={{ field_showCallout: false, block_calloutText: null }} featuredOverride={featuredOverride} />,
		);

		expect(defaults).toContain('Featured candidates and representatives');
		expect(defaults).toContain('This voter guide was built by GoodParty.org');
		expect(hidden).not.toContain('data-component="FeaturedCandidatesCallout"');
	});

	test('reads the background colour from the design settings', () => {
		const html = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection
				{...section}
				featuredCandidatesBlockDesignSettings={{ field_blockColorCreamMidnight: 'midnight' }}
				featuredOverride={featuredOverride}
			/>,
		);

		expect(html).toContain('bg-midnight-900');
	});
});

describe('resolveFeaturedPeopleMode', () => {
	test('a document saved before the field existed renders both', () => {
		expect(resolveFeaturedPeopleMode(undefined)).toBe('both');
		expect(resolveFeaturedPeopleMode('candidates')).toBe('candidates');
		expect(resolveFeaturedPeopleMode('representatives')).toBe('representatives');
	});
});
