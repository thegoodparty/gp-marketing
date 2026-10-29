import '~/testing/radixDialogServerRender';

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FeaturedCandidatesBlockSection } from '~/PageSections/FeaturedCandidatesBlockSection';
import { PledgeModalCallToAction } from '~/ui/PledgeModal';
import { ProfileHero } from '~/ui/ProfileHero';
import { PLEDGE_LOCATION_CALLOUT_COPY } from './pledgeCopyTest';

/**
 * The pledge copy test renders every arm into the cached HTML, control shown
 * and the rewrites hidden, and the head script swaps them per visitor. These
 * pin that each tested surface carries all three arms with control the one
 * visible by default, and that the untested states are left alone.
 *
 * Server-rendered, so the Radix primer goes first (see
 * `src/testing/radixDialogServerRender.ts`).
 */

/**
 * The text of the first wrapper for one arm, tags stripped: everything up to the
 * next arm or the end of the element the arms sit in. The wrappers hold nested
 * spans (the bold pledge name), so a lazy match on the closing tag stops short.
 */
function arm(html: string, name: string): string | null {
	const start = html.indexOf(`data-pledge-copy="${name}"`);
	if (start < 0) return null;
	const rest = html.slice(html.indexOf('>', start) + 1);
	const end = rest.search(/<(span|div) data-pledge-copy=|<\/(p|h3)>/);
	return (end < 0 ? rest : rest.slice(0, end)).replace(/<[^>]+>/g, '').replaceAll('&#x27;', "'").trim();
}

function armClass(html: string, name: string): string | null {
	return new RegExp(`data-pledge-copy="${name}" class="([^"]*)"`).exec(html)?.[1] ?? null;
}

describe('the pledged profile hero', () => {
	const render = (attribution: 'pledged' | 'notPledged' | 'pledgeIneligible') =>
		renderToStaticMarkup(<ProfileHero candidateName='Dana Ruiz' office='Mayor' attribution={attribution} />);

	test('carries all three arms of the sentence, with control visible and the rewrites hidden', () => {
		const html = render('pledged');
		expect(arm(html, 'control')).toBe(
			'This candidate took the GoodParty.org Pledge, promising to serve people first, independent of both major parties and big-money interests.',
		);
		expect(arm(html, 'b3')).toBe(
			"Dana Ruiz is running without either major party's endorsement. They signed the GoodParty.org Pledge to serve people first, independent of both major parties and big-money donors.",
		);
		expect(arm(html, 'alt')).toStartWith('If you check one thing about Dana Ruiz, check this.');
		expect(armClass(html, 'control')).toBe('contents');
		expect(armClass(html, 'b3')).toBe('hidden');
		expect(armClass(html, 'alt')).toBe('hidden');
	});

	test('rewrites the link label with the sentence', () => {
		const html = render('pledged');
		expect(html).toContain('See the pledge they signed');
		expect(html).toContain('Here&#x27;s what they pledged');
	});

	test('leaves the not-pledged and partisan sentences out of the test', () => {
		for (const mode of ['notPledged', 'pledgeIneligible'] as const) {
			const html = render(mode);
			expect(html).not.toContain('data-pledge-copy');
			expect(html).toContain('Read the full pledge');
		}
	});
});

describe('the location page callout', () => {
	const section = {
		_type: 'component_featuredCandidatesBlock',
		_key: 'test',
		featuredCandidatesBlockCallout: {
			field_showCallout: true,
			field_calloutTitle: 'Edited in Studio',
			field_showPledgeLink: true,
		},
		featuredCandidatesBlockDesignSettings: { field_featuredPeople: 'both' },
	} as unknown as Parameters<typeof FeaturedCandidatesBlockSection>[0];
	const people = [{ personId: 'p1', name: 'Person 1', office: 'Mayor', location: 'Austin, TX', href: '/people/p1', isPledged: true, role: 'candidate' }];

	test('keeps the editor’s title as control and adds both rewrites', () => {
		const html = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...section} featuredOverride={{ candidates: people, representatives: [] } as never} />,
		);
		expect(arm(html, 'control')).toBe('Edited in Studio');
		expect(arm(html, 'b3')).toBe(PLEDGE_LOCATION_CALLOUT_COPY.b3.title);
		expect(arm(html, 'alt')).toBe(PLEDGE_LOCATION_CALLOUT_COPY.alt.title);
		expect(html).toContain('See the pledge they signed');
	});

	test('still hides with the Show Callout switch', () => {
		const hidden = {
			...section,
			featuredCandidatesBlockCallout: { field_showCallout: false },
		} as unknown as Parameters<typeof FeaturedCandidatesBlockSection>[0];
		const html = renderToStaticMarkup(
			<FeaturedCandidatesBlockSection {...hidden} featuredOverride={{ candidates: people, representatives: [] } as never} />,
		);
		expect(html).not.toContain('data-pledge-copy');
	});
});

describe('the pop-up call to action', () => {
	test('control and visitors outside the test keep the Learn more button', () => {
		for (const variant of ['control', null] as const) {
			const html = renderToStaticMarkup(<PledgeModalCallToAction variant={variant} location='Austin' />);
			expect(html).toContain('Learn more');
			expect(html).not.toContain('data-pledge-modal-cta');
		}
	});

	test('b3 asks about the page’s place, with both buttons going to /about', () => {
		const html = renderToStaticMarkup(<PledgeModalCallToAction variant='b3' location='Austin' />);
		expect(html).toContain('Want a real choice in Austin&#x27;s next election?');
		expect(html).toContain('Get involved');
		expect(html).toContain('Learn more about GoodParty.org');
		expect(html.match(/href="\/about"/g)).toHaveLength(2);
	});

	test('alt has one button', () => {
		const html = renderToStaticMarkup(<PledgeModalCallToAction variant='alt' location={null} />);
		expect(html).toContain('What the GoodParty.org Pledge means for you');
		expect(html).toContain('Join the independent movement');
		expect(html.match(/href="\/about"/g)).toHaveLength(1);
	});
});
