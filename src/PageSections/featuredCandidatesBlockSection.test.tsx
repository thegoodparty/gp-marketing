import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FeaturedCandidatesBlockSection, resolveFeaturedBodyCopy, resolveFeaturedPeopleMode } from './FeaturedCandidatesBlockSection.tsx';
import type { FeaturedPersonCard } from '~/lib/featuredPeople';

/**
 * Runs the section through GROQ-shaped props. The schema names and the
 * projected names have to agree, and a wrong one reads as `undefined` rather
 * than as a type error.
 */
const section = {
	_type: 'component_featuredCandidatesBlock',
	_key: 'test',
	field_heading: 'Pledged people in [location]',
	field_bodyCopy: 'There are [count of candidates] pledged people in [location]. Meet them.',
	featuredCandidatesBlockCallout: {
		field_showCallout: true,
		field_calloutTitle: 'Why the badge',
		block_calloutText: [
			{
				_type: 'block',
				_key: 'callout',
				style: 'normal',
				children: [{ _type: 'span', _key: 'callout-span', text: 'The badge marks people who signed the pledge in [location].', marks: [] }],
				markDefs: [],
			},
		],
		field_showPledgeLink: true,
		field_pledgeLinkLabel: 'See the pledge',
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
	isPledged: true,
	isNonpartisan: true,
	role: 'candidate',
	electionDate: '2026-11-03',
	...overrides,
});

const featuredOverride = {
	candidates: [person(1, { avatarUrl: 'https://img.example/1.jpg' }), person(2, { isPledged: false, isNonpartisan: false })],
	representatives: [person(3, { role: 'representative', electionDate: null, office: 'Council Member' })],
};

const tokens = { '[location]': 'Houston' };

describe('FeaturedCandidatesBlockSection', () => {
	test('renders the heading, body copy, callout and one card per pledged person, with tokens resolved', () => {
		const html = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} tokens={tokens} featuredOverride={featuredOverride} />);

		expect(html).toContain('id="featured"');
		expect(html).toContain('Pledged people in Houston');
		expect(html).toContain('There are pledged people in Houston. Meet them.');
		expect(html).toContain('Why the badge');
		expect(html).toContain('The badge marks people who signed the pledge in Houston.');
		expect(html).toContain('See the pledge');
		expect(html.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(2);
		expect(html).toContain('Person 1');
		expect(html).toContain('Person 3');
		expect(html).not.toContain('Person 2');
		expect(html).toContain('href="/people/person-1"');
		expect(html).toContain('Council Member');
		expect(html).toContain('Has taken the GoodParty.org Pledge');
		expect(html).toContain('https://img.example/1.jpg');
	});

	/** No route supplies the count yet; when one does, the number lands in the sentence. */
	test('a candidate card says what they are running for; an official keeps the plain office', () => {
		const html = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} tokens={tokens} featuredOverride={featuredOverride} />);
		expect(html).toContain('Candidate for Mayor');
		expect(html).toContain('>Council Member<');
		expect(html).not.toContain('Candidate for Council Member');
	});

	test('fills the count placeholder from the page when it is supplied', () => {
		const html = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...section} tokens={tokens} featuredOverride={{ ...featuredOverride, pledgedCount: 12 }} />,
		);

		expect(html).toContain('There are 12 pledged people in Houston. Meet them.');
	});

	/** The location hero's seeded "See who's an independent" button jumps to #independents, so the block answers to it unless an editor picked another id. */
	test('answers to the independents anchor when no anchor id is set', () => {
		const html = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} componentSettings={null} featuredOverride={featuredOverride} />);
		expect(html).toContain('id="independents"');

		const custom = renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} featuredOverride={featuredOverride} />);
		expect(custom).toContain('id="featured"');
	});

	test('renders nothing at all, not even the section wrapper, when the page supplies nobody pledged', () => {
		expect(renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} tokens={tokens} />)).toBe('');
		expect(renderToStaticMarkup(<FeaturedCandidatesBlockSection {...section} featuredOverride={{ candidates: [], representatives: [] }} />)).toBe('');
		expect(
			renderToStaticMarkup(
				<FeaturedCandidatesBlockSection {...section} featuredOverride={{ candidates: [person(2, { isPledged: false })], representatives: [] }} />,
			),
		).toBe('');
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

		expect(candidatesOnly.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(1);
		expect(candidatesOnly).not.toContain('Person 3');
		expect(representativesOnly.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(1);
		expect(representativesOnly).toContain('Person 3');
	});

	test('falls back to the default heading, body copy, callout title, callout copy and link label', () => {
		const defaults = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection
				{...section}
				field_heading={undefined}
				field_bodyCopy={undefined}
				featuredCandidatesBlockCallout={{ field_showCallout: true, block_calloutText: null }}
				featuredOverride={featuredOverride}
			/>,
		);

		expect(defaults).toContain('Candidates and officials who took the GoodParty.org Pledge');
		expect(defaults).toContain('Candidates and elected officials near you who have taken the GoodParty.org Pledge.');
		expect(defaults).toContain('What this symbol means');
		expect(defaults).toContain('took the <strong>GoodParty.org Pledge</strong>, promising');
		expect(defaults).toContain('Read the full pledge');
	});

	test('hides the callout when switched off, and only the pledge link when that is switched off', () => {
		const hidden = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...section} featuredCandidatesBlockCallout={{ field_showCallout: false, block_calloutText: null }} featuredOverride={featuredOverride} />,
		);
		const noLink = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection
				{...section}
				featuredCandidatesBlockCallout={{ field_showCallout: true, block_calloutText: null, field_showPledgeLink: false }}
				featuredOverride={featuredOverride}
			/>,
		);

		expect(hidden).not.toContain('data-component="FeaturedCandidatesCallout"');
		expect(noLink).toContain('data-component="FeaturedCandidatesCallout"');
		expect(noLink).not.toContain('Read the full pledge');
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

describe('resolveFeaturedBodyCopy', () => {
	test('drops the count placeholder, and the gap it leaves, when the page supplies no count', () => {
		expect(resolveFeaturedBodyCopy('There are [count of candidates] candidates in [location].', undefined, tokens)).toBe(
			'There are candidates in Houston.',
		);
		expect(resolveFeaturedBodyCopy('Pledged people: [count of candidates].', null)).toBe('Pledged people:.');
	});

	test('fills it in when a count is supplied, zero included', () => {
		expect(resolveFeaturedBodyCopy('There are [count of candidates] candidates.', 7)).toBe('There are 7 candidates.');
		expect(resolveFeaturedBodyCopy('There are [count of candidates] candidates.', 0)).toBe('There are 0 candidates.');
	});

	test('an empty field falls back to the default copy', () => {
		expect(resolveFeaturedBodyCopy('   ', undefined)).toContain('Candidates and elected officials near you');
	});
});

describe('resolveFeaturedPeopleMode', () => {
	test('a document saved before the field existed renders both', () => {
		expect(resolveFeaturedPeopleMode(undefined)).toBe('both');
		expect(resolveFeaturedPeopleMode('candidates')).toBe('candidates');
		expect(resolveFeaturedPeopleMode('representatives')).toBe('representatives');
	});
});
