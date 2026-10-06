import '~/testing/radixDialogServerRender';

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { getDevPersonProfileView } from '~/lib/devPeopleProfileFixtures';
import type { PersonProfileView } from '~/lib/peopleProfile';
import { PLEDGE_SYMBOL_CALLOUT } from '~/ui/_lib/attributionCopy';
import { ElectionsSidebar } from '~/ui/ElectionsSidebar';
import { ProfileContentCard, type ProfileContentCardProps } from '~/ui/ProfileContentCard';
import { authoredDisclaimerCopy, buildPersonSectionOverrides } from './personSectionOverrides';

/**
 * Pins the Voter Guide round's three additions to the profile content block
 * (Emily, 2026-10-06): the siderail's pledge row, the disclaimer under the two
 * authored sections, and the "What this symbol means" box above Other Candidates.
 *
 * Server-rendered, because the box's "Read the full pledge" trigger is a Radix
 * dialog; hence the import on line one (see `src/testing/radixDialogServerRender.ts`).
 * Cards are rendered one at a time rather than through the whole block, so the
 * district map and the claim dialog stay out of the picture.
 */

const PLEDGE_ROW = 'Took the GoodParty.org Pledge';

function view(slug: string, over: Partial<PersonProfileView> = {}): PersonProfileView {
	const base = getDevPersonProfileView(slug);
	if (!base) throw new Error(`no dev fixture for ${slug}`);
	return { ...base, ...over };
}

function block(v: PersonProfileView) {
	const override = buildPersonSectionOverrides(v).component_profileContentBlock;
	if (!override) throw new Error('expected a profile content block override');
	return { cards: override.contentCards ?? [], sidebar: override.sidebar };
}

function sidebarHtml(v: PersonProfileView): string {
	const { sidebar } = block(v);
	return sidebar ? renderToStaticMarkup(<ElectionsSidebar {...sidebar} />) : '';
}

function cardHtml(card: ProfileContentCardProps): string {
	return renderToStaticMarkup(<ProfileContentCard {...card} bare />);
}

function cardWithHeading(cards: ProfileContentCardProps[], heading: string): ProfileContentCardProps {
	const card = cards.find(c => c.heading === heading || c.heading?.startsWith(heading));
	if (!card) throw new Error(`no "${heading}" card`);
	return card;
}

describe('the siderail states the pledge', () => {
	test('a pledged person with a date gets the row and its "Signed on" line', () => {
		const v = view('allen-slagle-74eee01a');
		// The premise: the fixture is pledged and dated, or the assertions test nothing.
		expect(v.pledged).toBe(true);
		expect(v.pledgedAt).toBe('2026-01-01');

		const html = sidebarHtml(v);
		expect(html).toContain(PLEDGE_ROW);
		expect(html).toContain('Signed on January 1, 2026');
		// The mark, by the viewBox of its artwork.
		expect(html).toContain('viewBox="35 42 137 116"');
	});

	test('without a date the row is the heading and the mark alone', () => {
		// Every live profile today: election-api carries no pledge date yet.
		const html = sidebarHtml(view('allen-slagle-74eee01a', { pledgedAt: null }));
		expect(html).toContain(PLEDGE_ROW);
		expect(html).not.toContain('Signed on');
	});

	test('someone who has not pledged gets no row', () => {
		const v = view('kim-byrd-b77f912d');
		expect(v.pledged).toBe(false);
		expect(sidebarHtml(v)).not.toContain(PLEDGE_ROW);
	});

	test('a date never shows without the pledge it belongs to', () => {
		const html = sidebarHtml(view('kim-byrd-b77f912d', { pledgedAt: '2026-01-01' }));
		expect(html).not.toContain(PLEDGE_ROW);
		expect(html).not.toContain('Signed on');
	});

	test('the row sits between Political Affiliation and Contact', () => {
		const html = sidebarHtml(view('allen-slagle-74eee01a'));
		const party = html.indexOf('Political Affiliation');
		const pledge = html.indexOf(PLEDGE_ROW);
		const contact = html.indexOf('>Contact<');
		expect(party).toBeGreaterThan(-1);
		expect(contact).toBeGreaterThan(-1);
		expect(pledge).toBeGreaterThan(party);
		expect(pledge).toBeLessThan(contact);
	});
});

describe('the disclaimer closes the authored sections', () => {
	test('state A: the platform card and About Me each end with it, naming the person', () => {
		const v = view('allen-slagle-74eee01a');
		const { cards } = block(v);
		const copy = authoredDisclaimerCopy(v.displayName);
		expect(copy).toBe(
			'These statements come from Allen Slagle and do not reflect any positions or stances on individual issues held by GoodParty.org.',
		);

		// A candidate has two authored cards: the last of Why + Campaign Issues, and About Me.
		const carriers = cards.filter(card => card.footer !== undefined);
		expect(carriers.map(card => card.heading)).toEqual(['Campaign Issues', 'About Me']);

		for (const card of carriers) {
			const html = cardHtml(card);
			expect(html).toContain(copy);
			// After the body, so it reads as a footnote to it.
			expect(html.indexOf(copy)).toBeGreaterThan(html.indexOf(card.heading ?? ''));
		}
		// Why I'm Running shares the platform card and must not carry a second copy.
		expect(cardHtml(cardWithHeading(cards, 'Why I’m Running for Office'))).not.toContain(copy);
	});

	test('state B: the in-office card ends with it too, on Accomplishments', () => {
		const v = view('tracy-good-ecff49d3');
		expect(v.persona).toBe('officeholder');
		const { cards } = block(v);
		expect(cards.filter(card => card.footer !== undefined).map(card => card.heading)).toEqual([
			'Accomplishments During This Term',
			'About Me',
		]);
		const html = cardHtml(cardWithHeading(cards, 'Accomplishments During This Term'));
		expect(html).toContain(authoredDisclaimerCopy(v.displayName));
		expect(cardHtml(cardWithHeading(cards, 'Top Priorities While in Office'))).not.toContain('These statements come from');
	});

	test('without accomplishments, Top Priorities carries it instead', () => {
		const { cards } = block(view('tracy-good-ecff49d3', { accomplishments: [] }));
		expect(cards.filter(card => card.footer !== undefined).map(card => card.heading)).toEqual([
			'Top Priorities While in Office',
			'About Me',
		]);
	});

	test('state C: serving and running closes all three authored cards', () => {
		const { cards } = block(view('susan-overman-ad914b82'));
		expect(cards.filter(card => card.footer !== undefined).map(card => card.heading)).toEqual([
			'Campaign Issues',
			'About Me',
			'Accomplishments During This Term',
		]);
	});

	test('when the owner wrote no issues, the Why section carries it instead', () => {
		const { cards } = block(view('allen-slagle-74eee01a', { issues: [] }));
		expect(cards.filter(card => card.footer !== undefined).map(card => card.heading)).toEqual(['Why I’m Running for Office', 'About Me']);
	});

	test('an unclaimed page carries none: the placeholders are ours, not the person’s', () => {
		const v = view('kim-byrd-b77f912d');
		expect(v.claimed).toBe(false);
		const { cards } = block(v);
		expect(cards.some(card => card.footer !== undefined)).toBe(false);
		const html = cards.filter(card => !card.raw && card.heading !== 'District information').map(cardHtml).join('');
		expect(html).not.toContain('These statements come from');
	});
});

describe('the Other Candidates list explains the mark', () => {
	test('state A: the box leads the list, with the pop-up link', () => {
		const { cards } = block(view('allen-slagle-74eee01a'));
		const html = cardHtml(cardWithHeading(cards, 'Other Candidates'));
		expect(html).toContain(PLEDGE_SYMBOL_CALLOUT.heading);
		expect(html).toContain(
			'Candidates and elected officials with this symbol took the <span class="font-bold">GoodParty.org Pledge</span>, promising to serve people first, independent of both major parties and big-money interests.',
		);
		expect(html).toContain('Read the full pledge');
		// Before the first card, not after.
		expect(html.indexOf('PledgeSymbolCallout')).toBeLessThan(html.indexOf('CandidatesCard'));
	});

	test('Nearby Officials gets no box', () => {
		const { cards } = block(view('tracy-good-ecff49d3'));
		const html = cardHtml(cardWithHeading(cards, 'Nearby Officials'));
		expect(html).toContain('CandidatesCard');
		expect(html).not.toContain(PLEDGE_SYMBOL_CALLOUT.heading);
	});
});

describe('the related-people rails show three cards, then "See more"', () => {
	function count(html: string, marker: string): number {
		return html.split(marker).length - 1;
	}

	test('Other Candidates: three of five on first paint, with the button', () => {
		const v = view('allen-slagle-74eee01a');
		expect(v.otherCandidates.length).toBe(5);
		const html = cardHtml(cardWithHeading(block(v).cards, 'Other Candidates'));
		expect(count(html, 'data-component="CandidatesCard"')).toBe(3);
		expect(html).toContain('See more');
	});

	test('Nearby Officials: the same rule', () => {
		const v = view('tracy-good-ecff49d3');
		expect(v.nearbyOfficials.length).toBe(6);
		const html = cardHtml(cardWithHeading(block(v).cards, 'Nearby Officials'));
		expect(count(html, 'data-component="CandidatesCard"')).toBe(3);
		expect(html).toContain('See more');
	});

	test('a short list has no button', () => {
		const v = view('allen-slagle-74eee01a');
		const html = cardHtml(cardWithHeading(block({ ...v, otherCandidates: v.otherCandidates.slice(0, 2) }).cards, 'Other Candidates'));
		expect(count(html, 'data-component="CandidatesCard"')).toBe(2);
		expect(html).not.toContain('See more');
	});
});

describe('the rails lead with the pledged people', () => {
	test('state A: pledged, then unpledged non-partisan, then major party, stable within each', () => {
		const v = view('allen-slagle-74eee01a');
		const source = v.otherCandidates;
		// The premise: the fixture mixes all three groups out of order.
		expect(source.some(c => c.isPledged)).toBe(true);
		expect(source.some(c => c.majorParty)).toBe(true);
		expect(source.findIndex(c => c.majorParty)).toBeLessThan(source.findIndex(c => c.isPledged));

		const cards = block(v).cards;
		const rail = cardWithHeading(cards, 'Other Candidates');
		// Three render on first paint; rank the source the same way and compare the names.
		const tier = (c: (typeof source)[number]) => (c.isPledged || c.isEmpowered ? 0 : c.majorParty ? 2 : 1);
		const expected = [0, 1, 2].flatMap(t => source.filter(c => tier(c) === t)).map(c => c.name);
		const html = cardHtml(rail);
		const rendered = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1] ?? '');
		expect(rendered).toEqual(expected.slice(0, 3));
		// The Republican the feed puts second is not on the first page at all.
		const republican = source.find(c => c.majorParty);
		expect(rendered).not.toContain(republican?.name);
	});

	test('Nearby Officials follows the same rule', () => {
		const v = view('tracy-good-ecff49d3');
		const source = v.nearbyOfficials;
		const tier = (c: (typeof source)[number]) => (c.isPledged || c.isEmpowered ? 0 : c.majorParty ? 2 : 1);
		const expected = [0, 1, 2].flatMap(t => source.filter(c => tier(c) === t)).map(c => c.name);
		const html = cardHtml(cardWithHeading(block(v).cards, 'Nearby Officials'));
		const rendered = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1] ?? '');
		expect(rendered).toEqual(expected.slice(0, 3));
	});
});

describe('the cards carry the district tag and the mark', () => {
	test('other candidates share the race\u2019s district; nearby officials each have their own', () => {
		const a = cardHtml(cardWithHeading(block(view('allen-slagle-74eee01a')).cards, 'Other Candidates'));
		expect(a.split('District 5').length - 1).toBe(3);
		const b = cardHtml(cardWithHeading(block(view('tracy-good-ecff49d3')).cards, 'Nearby Officials'));
		expect(b).toContain('Ward 1');
		expect(b).toContain('Ward 3');
	});

	test('a card with no district has no tag', () => {
		const v = view('allen-slagle-74eee01a');
		const html = cardHtml(
			cardWithHeading(block({ ...v, otherCandidates: v.otherCandidates.map(c => ({ ...c, tag: null })) }).cards, 'Other Candidates'),
		);
		expect(html).not.toContain('CandidatesCardTag');
	});

	test('the mark follows the pledge, without the yellow frame', () => {
		const v = view('allen-slagle-74eee01a');
		const pledged = v.otherCandidates.filter(c => c.isPledged && !c.isEmpowered);
		expect(pledged.length).toBeGreaterThan(0);
		const html = cardHtml(cardWithHeading(block({ ...v, otherCandidates: pledged }).cards, 'Other Candidates'));
		// One mark in the box, one per pledged card, none in a yellow frame.
		expect(html.split('viewBox="35 42 137 116"').length - 1).toBe(1 + pledged.length);
		expect(html).not.toContain('border-bright-yellow-600');
	});
});
