import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ElectionsPositionHeroSection } from '~/PageSections/ElectionsPositionHeroSection';
import type { OfficeData } from '~/PageSections/ElectionsPositionHeroSection';

/**
 * Runs the hero through its section wrapper with route-shaped data, so the
 * state resolver, the Sanity field names and the card rules are exercised
 * together. The empty states matter most: a card that renders with nothing in
 * it is the silent failure the redesign doc warns about, and no boundary
 * catches it because nothing throws.
 */
const section = {
	_type: 'component_electionsPositionHero' as const,
	_key: 'hero',
	ctaAction: null,
};

const candidates: OfficeData['candidates'] = [
	{ key: '1', name: 'Tom Nguyen', party: 'Independent', partyClass: 'independent', isPledged: true },
	{ key: '2', name: 'Maria Hernandez', party: 'Democratic', partyClass: 'democrat' },
];

const office: OfficeData = {
	officeName: 'City Council Member',
	stateName: 'Texas',
	cityName: 'Austin',
	electionDate: 'November 3, 2026',
	filingDate: 'June 1, 2026 - October 2, 2026',
	electionDateIso: '2026-11-03T00:00:00.000Z',
	filingDateStartIso: '2026-06-01T00:00:00.000Z',
	filingDateEndIso: '2026-10-02T00:00:00.000Z',
	candidatesHref: '/elections/tx/austin/position/city-council-member/candidates',
	candidates,
};

const render = (data: OfficeData, now: string, extra: Record<string, unknown> = {}) =>
	renderToStaticMarkup(<ElectionsPositionHeroSection {...section} {...extra} officeData={data} now={new Date(`${now}T12:00:00`)} />);

describe('ElectionsPositionHeroSection', () => {
	test('while filing is open it shows the deadline, both countdowns and the ballot', () => {
		const html = render(office, '2026-08-15');

		expect(html).toContain('data-phase="filing"');
		expect(html).toContain('Filing deadline');
		expect(html).toContain('October 2, 2026');
		expect(html).toContain('Days to file');
		expect(html).toContain('Days until election');
		expect(html).toContain('On the ballot');
		expect(html).toContain('<strong>2</strong> candidates filed so far');
		expect(html).toContain('Tom Nguyen');
		expect(html).toContain('View all candidates');
		expect(html).toContain('Filing is open for this race.');
	});

	test('before the window opens it counts down to filing opening instead', () => {
		const html = render(office, '2026-02-10');

		expect(html).toContain('Filing opens');
		expect(html).toContain('June 1, 2026');
		expect(html).toContain('Days until filing opens');
		expect(html).not.toContain('Days to file');
	});

	test('mid-election it drops the filing deadline and draws the timeline', () => {
		const html = render(office, '2026-10-20');

		expect(html).toContain('data-phase="midElection"');
		expect(html).not.toContain('October 2, 2026');
		expect(html).toContain('Days until election');
		expect(html).toContain('data-testid="position-hero-timeline"');
		expect(html).toContain('Election day');
		expect(html).toContain('Everything you need to know about this race.');
	});

	test('after election day with no results it keeps the date and timeline but loses the countdown and the ballot card', () => {
		const html = render(office, '2026-11-10');

		expect(html).toContain('data-phase="midElection"');
		expect(html).toContain('November 3, 2026');
		expect(html).toContain('data-testid="position-hero-timeline"');
		expect(html).not.toContain('Days until election');
		expect(html).not.toContain('data-testid="position-hero-ballot-card"');
	});

	test('with a winner it shows the winner card and marks them in the results', () => {
		const html = render(
			{
				...office,
				candidates: candidates.map(c => ({ ...c, isWinner: c.key === '1' })),
				winners: [{ key: '1', name: 'Tom Nguyen', party: 'Independent', term: '2027 to 2031', isPledged: true }],
			},
			'2026-12-01',
		);

		expect(html).toContain('data-phase="decided"');
		expect(html).toContain('Race winner');
		expect(html).toContain('Independent · Current term 2027 to 2031');
		expect(html).toContain('Has taken the GoodParty.org Pledge');
		expect(html).toContain('Final results');
		expect(html).toContain('candidates ran');
		expect(html).toContain('aria-label="Winner"');
		expect(html).toContain('View full results');
		expect(html).toContain('This race has been decided.');
	});

	test('with several winners it labels the button with the seat count and lists the others', () => {
		const html = render(
			{
				...office,
				seatCount: 3,
				winners: [
					{ key: '1', name: 'Tom Nguyen' },
					{ key: '2', name: 'Maria Hernandez' },
					{ key: '3', name: 'Aisha Okonkwo' },
				],
			},
			'2026-12-01',
		);

		expect(html).toContain('View all 3 winners');
		expect(html).toContain('+2 other winners');
	});

	test('more than six months before filing opens, the previous winner holds the decided state', () => {
		const html = render(
			{
				...office,
				winners: [],
				priorWinners: [{ key: 'p1', name: 'Grace Hopper', party: 'Independent', term: '2023 to 2027' }],
			},
			'2025-11-20',
		);

		expect(html).toContain('data-phase="decided"');
		expect(html).toContain('data-testid="position-hero-winner-card"');
		expect(html).toContain('Grace Hopper');
		expect(html).toContain('Independent · Current term 2023 to 2027');
		expect(html).toContain('This race has been decided.');
	});

	test('inside six months of filing opening, the previous winner gives way to the filing state', () => {
		const html = render(
			{ ...office, winners: [], priorWinners: [{ key: 'p1', name: 'Grace Hopper' }] },
			'2026-02-10',
		);

		expect(html).toContain('data-phase="filing"');
		expect(html).not.toContain('Grace Hopper');
		expect(html).toContain('Days until filing opens');
	});

	test('hides the ballot card when we hold no candidate data, but shows a real zero', () => {
		const noData = render({ ...office, candidates: undefined }, '2026-08-15');
		expect(noData).not.toContain('data-testid="position-hero-ballot-card"');
		expect(noData).toContain('data-testid="position-hero-dates-card"');

		const zero = render({ ...office, candidates: [] }, '2026-08-15');
		expect(zero).toContain('<strong>0</strong> candidates filed so far');
	});

	test('pledged candidates get the mark, everyone else a party dot', () => {
		const html = render(office, '2026-08-15');

		expect(html).toContain('aria-label="Took the GoodParty.org Pledge"');
		expect(html).toContain('bg-goodparty-blue');
	});

	test('an editor-supplied intro wins over the default and resolves tokens', () => {
		const html = render(office, '2026-08-15', {
			field_filingIntro: 'Run for [office name] in [location].',
			tokens: { '[office name]': 'City Council Member', '[location]': 'Austin, Texas' },
		});

		expect(html).toContain('Run for City Council Member in Austin, Texas.');
		expect(html).not.toContain('Filing is open for this race.');
	});
});
