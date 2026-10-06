import '~/testing/radixDialogServerRender';

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
	{ key: '1', name: 'Tom Nguyen', party: 'Independent', isPledged: true, href: '/people/tom-nguyen-1', seatLabel: 'District 1' },
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

/** Where a section's test id first appears, so an order can be asserted. */
const at = (html: string, id: string) => html.indexOf(`data-testid="${id}"`);

describe('ElectionsPositionContentBlockSection', () => {
	test('while filing is open it renders every section with the default copy and resolved tokens', () => {
		const html = render(override, '2026-08-15');

		expect(html).toContain('data-phase="filing"');
		expect(html).toContain('data-layout="people-first"');
		expect(html).toContain('Candidates for City Council Member');
		expect(html).toContain('Learn about candidates who have filed to run for City Council Member.');
		expect(html).not.toContain('Results for City Council Member');
		expect(html).toContain('What this symbol means');
		expect(html).toContain('<strong>GoodParty.org Pledge</strong>');
		expect(html).toContain('Read the full pledge');
		expect(html).toContain('Who&#x27;s currently in office');
		expect(html).toContain('Learn about who represents you in Austin.');
		expect(html).toContain('Independent · Current term 2023 to 2027');
		expect(html).toContain('Has taken the GoodParty.org Pledge');
		expect(html).toContain('Explore more races in Austin');
		expect(html).toContain('See all Austin races');
		expect(html).toContain('Are you ready for Austin&#x27;s next election?');
		expect(html).toContain('Check my registration');
		expect(html).toContain('About City Council Member');
		expect(html).toContain('Sets city policy.');
		expect(html).toContain('Run-off election');
		expect(html).toContain('How to run for City Council Member');
		expect(html).toContain('Meet eligibility requirements');
		expect(html).toContain('File for office');
		expect(html).toContain('>Step 3<');
		expect(html).toContain('Launch your campaign');
		expect(html).toContain('href="/run-for-office"');
		expect(html).toContain('GoodParty.org Community');
		expect(html).not.toContain('[office name]');
		expect(html).not.toContain('[County or City]');
	});

	test('the people lists come first, then voting, then About and How to run', () => {
		const html = render(override, '2026-08-15');
		expect(at(html, 'position-candidates')).toBeGreaterThan(-1);
		expect(at(html, 'position-candidates')).toBeLessThan(at(html, 'position-officeholders'));
		expect(at(html, 'position-officeholders')).toBeLessThan(at(html, 'position-voter-readiness'));
		expect(at(html, 'position-voter-readiness')).toBeLessThan(at(html, 'position-about'));
		expect(at(html, 'position-about')).toBeLessThan(at(html, 'position-how-to-run'));
	});

	test('before the filing window opens, About and How to run lead and the "On this page" links follow', () => {
		const html = render(override, '2026-01-15');

		expect(html).toContain('data-phase="filing"');
		expect(html).toContain('data-layout="about-first"');
		expect(at(html, 'position-about')).toBeGreaterThan(-1);
		expect(at(html, 'position-about')).toBeLessThan(at(html, 'position-how-to-run'));
		expect(at(html, 'position-how-to-run')).toBeLessThan(at(html, 'position-candidates'));
		expect(at(html, 'position-candidates')).toBeLessThan(at(html, 'position-voter-readiness'));
		expect(html.indexOf('href="#position-about"')).toBeLessThan(html.indexOf('href="#position-candidates"'));
	});

	test('the voter readiness links default to the voter pages on this site', () => {
		const html = render(override, '2026-08-15');

		expect(html).toContain('href="/check-voter-registration"');
		expect(html).toContain('href="/find-polling-place"');
		expect(html).toContain('href="/request-mail-in-ballot"');
	});

	test('the pledge explainer sits inside each list and its link can be switched off', () => {
		const html = render(override, '2026-08-15');
		expect(html.match(/data-testid="position-pledge-explainer"/g)).toHaveLength(2);
		expect(at(html, 'position-candidates')).toBeLessThan(at(html, 'position-pledge-explainer'));

		const withoutLink = render(override, '2026-08-15', { pledgeExplainer: { field_showPledgeLink: false } });
		expect(withoutLink).toContain('What this symbol means');
		expect(withoutLink).not.toContain('Read the full pledge');
	});

	test('the explore card wraps the name of the pledge in the pop-up trigger', () => {
		const html = render(override, '2026-08-15');
		expect(html).toMatch(/<button type="button" class="font-medium text-info-500 underline underline-offset-2"[^>]*aria-haspopup="dialog"[^>]*>GoodParty\.org Pledge<\/button>/);
	});

	test('a seat label is drawn as a chip next to the name, not in the meta line', () => {
		const html = render(override, '2026-08-15');
		expect(html).toContain('data-testid="position-person-seat">District 1<');
		expect(html).toContain('data-testid="position-person-seat">Seat 2<');
		expect(html).not.toContain('· Seat 2');
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
		expect(html).toContain('data-layout="people-first"');
		expect(html).toContain('Candidates for City Council Member');
		expect(html).not.toContain('data-testid="position-election-over"');
		expect(html).not.toContain('Elected');
	});

	test('once decided it switches to results, tags the winners and shows the election-over banner', () => {
		const html = render({ ...override, winners: [{ key: '1', name: 'Tom Nguyen', isPledged: true }] }, '2026-12-01');

		expect(html).toContain('data-phase="decided"');
		expect(html).toContain('data-layout="people-first"');
		expect(html).toContain('Results for City Council Member');
		expect(html).not.toContain('Candidates for City Council Member');
		expect(html).toContain('>Elected<');
		expect(html).toContain('data-testid="position-election-over"');
		expect(html).toContain('This election is over.');
	});

	test('after election day with no result it stays mid-election, like the hero', () => {
		expect(render(override, '2026-11-10')).toContain('data-phase="midElection"');
	});

	test('hides the candidates list, its nav link and the pledge explainer when the route holds no candidate data', () => {
		const html = render({ ...override, candidates: undefined, officeholders: undefined }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).not.toContain('data-testid="position-officeholders"');
		expect(html).not.toContain('data-testid="position-pledge-explainer"');
		expect(html).not.toContain('Candidates for City Council Member');
		expect(html).toContain('data-testid="position-about"');
		expect(html).toContain('data-testid="position-how-to-run"');
	});

	test('an empty candidate list hides the list too; officeholders keep their explainer', () => {
		const html = render({ ...override, candidates: [] }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).toContain('data-testid="position-officeholders"');
		expect(html.match(/data-testid="position-pledge-explainer"/g)).toHaveLength(1);
	});

	test('hides the About card, the data steps and the explore card when the page supplies nothing for them', () => {
		const html = render({ electionDateIso: override.electionDateIso, filingDateEndIso: override.filingDateEndIso }, '2026-08-15');

		expect(html).not.toContain('data-testid="position-about"');
		expect(html).not.toContain('data-testid="position-explore-card"');
		expect(html).not.toContain('Meet eligibility requirements');
		expect(html).not.toContain('File for office');
		expect(html).not.toContain('>Step 1<');
		expect(html).not.toContain('>Step 3<');
		expect(html).toContain('Launch your campaign');
		expect(html).toContain('data-testid="position-voter-readiness"');
	});

	test('with no override at all (a Studio template preview) it still renders the editorial sections and nothing empty', () => {
		const html = render(undefined, '2026-08-15');

		expect(html).toContain('data-component="ElectionsPositionContentBlock"');
		expect(html).not.toContain('data-testid="position-candidates"');
		expect(html).not.toContain('data-testid="position-pledge-explainer"');
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
			peopleLists: { field_candidatesHeading: 'Running for [office name] in [County or City]', field_candidatesIntro: 'Filed in [County or City].' },
			howToRun: { field_step3Title: 'Start your run' },
			pledgeExplainer: { field_title: 'About the mark' },
		});

		expect(html).toContain('Running for City Council Member in Austin');
		expect(html).toContain('Filed in Austin.');
		expect(html).not.toContain('>Candidates for City Council Member<');
		expect(html).toContain('Start your run');
		expect(html).toContain('About the mark');
	});

	test('the midnight setting recolours the section headings', () => {
		const html = render(override, '2026-08-15', {
			electionsPositionContentBlockDesignSettings: { field_blockColorCreamMidnight: 'Midnight' },
		});
		expect(html).toContain('bg-midnight-900');
	});
});
