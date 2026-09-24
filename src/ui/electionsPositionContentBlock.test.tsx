import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
	ElectionsPositionContentBlockSection,
	type ElectionsPositionContentBlockOverride,
} from '~/PageSections/ElectionsPositionContentBlockSection';

/**
 * Runs the block through its section wrapper with route-shaped data, so the
 * shared state resolver, the Sanity field names, the defaults and the hide
 * rules are exercised together. The hide rules matter most: this block sits on
 * the live Position template, so a section that renders an empty shell for a
 * race with no data would do so on tens of thousands of pages, and no boundary
 * would catch it because nothing throws.
 */
const section = {
	_type: 'component_electionsPositionContentBlock' as const,
	_key: 'content',
	electionsPositionContentBlockDesignSettings: null,
	componentSettings: null,
};

const tokens = { '[office name]': 'City Council Member', '[County or City]': 'Austin', '[location]': 'Austin, Texas' };

const candidates: ElectionsPositionContentBlockOverride['candidates'] = [
	{ key: '1', name: 'Tom Nguyen', party: 'Independent', isPledged: true, href: '/people/tom-nguyen-1' },
	{ key: '2', name: 'Maria Hernandez', party: 'Democratic', href: '/people/maria-hernandez-2' },
	{ key: '3', name: 'Aisha Okonkwo', party: 'Democratic' },
	{ key: '4', name: 'James Whitfield', party: 'Republican' },
	{ key: '5', name: 'Priya Raman', party: 'Libertarian' },
];

const override: ElectionsPositionContentBlockOverride = {
	electionDateIso: '2026-11-03T00:00:00.000Z',
	filingDateStartIso: '2026-06-01T00:00:00.000Z',
	filingDateEndIso: '2026-10-02T00:00:00.000Z',
	candidates,
	officeholders: [{ key: 'o1', name: 'Grace Hopper', party: 'Independent', term: '2023 to 2027', seatLabel: 'Seat 2', isPledged: true }],
	locationHref: '/elections/tx/travis-county/austin',
	shareUrl: 'https://goodparty.org/elections/tx/travis-county/austin/position/city-council-member',
	about: {
		description: 'Sets city policy.',
		attributes: [{ label: 'Typical salary', value: '$115,000 / year' }],
		electionTypes: [{ label: 'Run-off election', checked: true }],
	},
	howToRun: {
		eligibility: 'Must be a registered voter.',
		filing: [{ label: 'Filing period', value: 'June 1, 2026 - October 2, 2026' }],
	},
};

const render = (data: ElectionsPositionContentBlockOverride | undefined, now: string, extra: Record<string, unknown> = {}) =>
	renderToStaticMarkup(
		<ElectionsPositionContentBlockSection
			{...section}
			{...extra}
			tokens={tokens}
			contentOverride={data}
			now={new Date(`${now}T12:00:00`)}
		/>,
	);

describe('ElectionsPositionContentBlockSection', () => {
	test('while filing is open it renders every section with the default copy and resolved tokens', () => {
		const html = render(override, '2026-08-15');

		expect(html).toContain('data-phase="filing"');
		expect(html).toContain('Candidates for City Council Member');
		expect(html).not.toContain('Results for City Council Member');
		expect(html).toContain('data-testid="position-badge-callout"');
		expect(html).toContain('What this badge means');
		expect(html).toContain('Who&#x27;s currently in office');
		expect(html).toContain('Independent · Current term 2023 to 2027 · Seat 2');
		expect(html).toContain('Has taken the GoodParty.org Pledge');
		expect(html).toContain('Explore more races in Austin');
		expect(html).toContain('See all Austin races');
		expect(html).toContain('Know someone who should run for City Council Member?');
		expect(html).toContain('Are you ready for Austin&#x27;s next election?');
		expect(html).toContain('Check my registration');
		expect(html).toContain('About City Council Member');
		expect(html).toContain('Sets city policy.');
		expect(html).toContain('Run-off election');
		expect(html).toContain('How to run for City Council Member');
		expect(html).toContain('Meet eligibility requirements');
		expect(html).toContain('File for office');
		expect(html).toContain('Launch your campaign');
		expect(html).toContain('href="/run-for-office"');
		expect(html).toContain('GoodParty.org Community');
		expect(html).not.toContain('[office name]');
		expect(html).not.toContain('[County or City]');
	});

	test('the branded CTA speaks about pledged candidates when one is running, and about the lack of them otherwise', () => {
		expect(render(override, '2026-08-15')).toContain('Candidates for City Council Member have taken the GoodParty.org Pledge');
		expect(render({ ...override, candidates: candidates.map(c => ({ ...c, isPledged: false })) }, '2026-08-15')).toContain(
			'There aren&#x27;t any candidates for City Council Member',
		);
	});

	test('the first four candidates render on the server and the rest wait behind "See more"', () => {
		const html = render(override, '2026-08-15');

		expect(html).toContain('Tom Nguyen');
		expect(html).toContain('James Whitfield');
		expect(html).not.toContain('Priya Raman');
		expect(html).toContain('See more candidates');
	});

	test('mid-election the body is the same as filing', () => {
		const html = render(override, '2026-10-20');

		expect(html).toContain('data-phase="midElection"');
		expect(html).toContain('Candidates for City Council Member');
		expect(html).not.toContain('data-testid="position-election-over"');
		expect(html).not.toContain('Elected');
	});

	test('once decided it switches to results, tags the winners, shows the winner copy and the election-over banner', () => {
		const html = render({ ...override, winners: [{ key: '1', name: 'Tom Nguyen', isPledged: true }] }, '2026-12-01');

		expect(html).toContain('data-phase="decided"');
		expect(html).toContain('Results for City Council Member');
		expect(html).not.toContain('Candidates for City Council Member');
		expect(html).toContain('>Elected<');
		expect(html).toContain('A GoodParty.org candidate won this race.');
		expect(html).toContain('data-testid="position-election-over"');
		expect(html).toContain('This election is over.');
	});

	test('a decided race with no pledged winner gets the "step up to run next" copy', () => {
		const html = render({ ...override, winners: [{ key: '2', name: 'Maria Hernandez' }] }, '2026-12-01');

		expect(html).toContain('There weren&#x27;t any winners this cycle who took the GoodParty.org Pledge');
		expect(html).not.toContain('A GoodParty.org candidate won this race.');
	});

	test('after election day with no result it stays mid-election, like the hero', () => {
		expect(render(override, '2026-11-10')).toContain('data-phase="midElection"');
	});

	test('hides the candidates list, its nav link and the badge callout when the route holds no candidate data', () => {
		const html = render({ ...override, candidates: undefined, officeholders: undefined }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).not.toContain('data-testid="position-officeholders"');
		expect(html).not.toContain('data-testid="position-badge-callout"');
		expect(html).not.toContain('Candidates for City Council Member');
		expect(html).toContain('data-testid="position-about"');
		expect(html).toContain('data-testid="position-how-to-run"');
	});

	test('an empty candidate list hides the list too; officeholders keep the callout', () => {
		const html = render({ ...override, candidates: [] }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).toContain('data-testid="position-officeholders"');
		expect(html).toContain('data-testid="position-badge-callout"');
	});

	test('hides the About card, the data steps, the explore card and the share card when the page supplies nothing for them', () => {
		const html = render({ electionDateIso: override.electionDateIso, filingDateEndIso: override.filingDateEndIso }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-about"');
		expect(html).not.toContain('data-testid="position-explore-card"');
		expect(html).not.toContain('data-testid="position-share-card"');
		expect(html).not.toContain('Meet eligibility requirements');
		expect(html).not.toContain('File for office');
		expect(html).toContain('Step 1');
		expect(html).toContain('Launch your campaign');
		expect(html).toContain('data-testid="position-branded-cta"');
		expect(html).toContain('data-testid="position-voter-readiness"');
	});

	test('with no override at all (a Studio template preview) it still renders the editorial sections and nothing empty', () => {
		const html = render(undefined, '2026-08-15');

		expect(html).toContain('data-component="ElectionsPositionContentBlock"');
		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).not.toContain('data-testid="position-badge-callout"');
		expect(html).not.toContain('data-testid="position-about"');
		expect(html).not.toContain('href="#position-candidates"');
		expect(html).toContain('href="#position-vote"');
		expect(html).toContain('data-testid="position-voter-readiness"');
		expect(html).toContain('Launch your campaign');
	});

	test('the "On this page" links only name sections that rendered', () => {
		const html = render({ ...override, officeholders: undefined, about: undefined }, '2026-08-15');

		expect(html).toContain('href="#position-candidates"');
		expect(html).not.toContain('href="#position-officeholders"');
		expect(html).not.toContain('href="#position-about"');
		expect(html).toContain('href="#position-how-to-run"');
	});

	test('the seat filter is offered only when the route built one with a choice', () => {
		const withoutFilter = render(override, '2026-08-15');
		expect(withoutFilter).not.toContain('<select');

		const withFilter = render(
			{
				...override,
				seatFilter: {
					label: 'Filter by Seat',
					options: [
						{ value: '1', label: 'Seat 1' },
						{ value: '2', label: 'Seat 2' },
					],
				},
			},
			'2026-08-15',
		);
		expect(withFilter).toContain('<select');
		expect(withFilter).toContain('Filter by Seat');
	});

	test('editor-supplied copy wins over the defaults and resolves tokens', () => {
		const html = render(override, '2026-08-15', {
			peopleLists: { field_candidatesHeading: 'Running for [office name] in [County or City]' },
			howToRun: { field_step3Title: 'Start your run' },
			brandedCta: { field_pledgedRunningHeadline: 'Independents are running in [County or City].' },
		});

		expect(html).toContain('Running for City Council Member in Austin');
		expect(html).not.toContain('>Candidates for City Council Member<');
		expect(html).toContain('Start your run');
		expect(html).toContain('Independents are running in Austin.');
	});

	test('the midnight setting recolours the section headings', () => {
		const html = render(override, '2026-08-15', {
			electionsPositionContentBlockDesignSettings: { field_blockColorCreamMidnight: 'Midnight' },
		});
		expect(html).toContain('bg-midnight-900');
	});
});
