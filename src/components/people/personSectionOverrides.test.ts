/**
 * Locks the profile content-section ORDER to the Figma frames.
 *
 * The order regressed repeatedly because it lived as one shared list while the
 * frames actually differ per persona, and nothing asserted it. These cases are
 * transcribed from the frames themselves:
 *   A 1901:50309 (candidate)     B 1901:52117 (officeholder)
 *   C 1901:53123 (both)          G 1958:110869 (past)
 * If a frame changes, update the expectation here and cite the node id.
 */
import { describe, expect, test } from 'bun:test';
import { getDevPersonProfileView } from '~/lib/devPeopleProfileFixtures';
import { chunkCardGroups } from '~/ui/_lib/chunkCardGroups';
import { buildPersonSectionOverrides } from './personSectionOverrides';

function contentCards(slug: string) {
	const view = getDevPersonProfileView(slug);
	if (!view) throw new Error(`no dev fixture for ${slug}`);
	return buildPersonSectionOverrides(view).component_profileContentBlock?.contentCards ?? [];
}

/** Ordered headings of the content well, ignoring the chrome-less raw cards. */
function sectionHeadings(slug: string): string[] {
	return contentCards(slug).flatMap(card => (card.heading ? [card.heading] : []));
}

describe('profile section order matches the Figma frames', () => {
	test('state A — candidate meets other candidates before the office', () => {
		expect(sectionHeadings('allen-slagle-74eee01a')).toEqual([
			'Why I\u2019m Running for Office',
			'Campaign Issues',
			'About Me',
			'Recent Experience',
			// A candidate-only person holds no seat, so the office name comes from
			// the candidacy rather than a held office.
			'Other Candidates for Mayor of Springfield',
			'About Mayor of Springfield',
			'District information',
		]);
	});

	test('state B — officeholder leads with the in-office record, district before office', () => {
		expect(sectionHeadings('tracy-good-ecff49d3')).toEqual([
			'Top Priorities While in Office',
			'Accomplishments During This Term',
			'About Me',
			'Recent Experience',
			'District information',
			'About Springfield City Council',
			'Nearby Officials',
		]);
	});

	test('state C — serving and running keeps campaign and in-office issues separate', () => {
		const headings = sectionHeadings('susan-overman-ad914b82');
		expect(headings).toEqual([
			'Why I\u2019m Running for Office',
			'Campaign Issues',
			'About Me',
			'Recent Experience',
			'Other Candidates for Springfield City Council',
			'Top Priorities While in Office',
			'Accomplishments During This Term',
			'About Springfield City Council',
			'District information',
			'Nearby Officials',
		]);
		// The two issue sections must stay distinct — they were previously merged
		// into a single card because every seeded issue carried a status.
		expect(headings.filter(h => h === 'Campaign Issues')).toHaveLength(1);
		expect(headings.filter(h => h === 'Top Priorities While in Office')).toHaveLength(1);
	});

	test('state G — past official opens with About Me and closes with other candidates', () => {
		expect(sectionHeadings('bill-fortner-61a42912')).toEqual([
			'About Me',
			'Recent Experience',
			'Why I Served',
			'Campaign Issues',
			'Top Priorities While in Office',
			'Accomplishments During This Term',
			'District information',
			'About Springfield City Council',
			'Nearby Officials',
			'Other Candidates for Springfield City Council',
		]);
	});

	test('a pure candidate never shows an in-office section', () => {
		const headings = sectionHeadings('allen-slagle-74eee01a');
		expect(headings).not.toContain('Accomplishments During This Term');
		expect(headings).not.toContain('Top Priorities While in Office');
		expect(headings).not.toContain('Nearby Officials');
	});
});

describe('card grouping sets the Figma heading levels', () => {
	/** Headings per white card: the first is the 32/44 one, the rest are 24/32. */
	function headingsByCard(slug: string): string[][] {
		return chunkCardGroups(contentCards(slug))
			.map(group => group.flatMap(card => (card.heading ? [card.heading] : [])))
			.filter(headings => headings.length > 0);
	}

	test('state A pairs each lead section with its sub-section', () => {
		expect(headingsByCard('allen-slagle-74eee01a')).toEqual([
			['Why I\u2019m Running for Office', 'Campaign Issues'],
			['About Me', 'Recent Experience'],
			['Other Candidates for Mayor of Springfield'],
			['About Mayor of Springfield'],
			['District information'],
		]);
	});

	test('accomplishments sit under the in-office priorities, not beside them', () => {
		expect(headingsByCard('tracy-good-ecff49d3')[0]).toEqual([
			'Top Priorities While in Office',
			'Accomplishments During This Term',
		]);
	});

	test('state G keeps nearby officials and other candidates in separate cards', () => {
		const cards = headingsByCard('bill-fortner-61a42912');
		expect(cards).toContainEqual(['Nearby Officials']);
		expect(cards).toContainEqual(['Other Candidates for Springfield City Council']);
	});
});

describe('hero', () => {
	test('state C shows the seat held above the candidacy', () => {
		const view = getDevPersonProfileView('susan-overman-ad914b82');
		const hero = buildPersonSectionOverrides(view!).component_profileHero;
		expect(hero?.secondaryOffice).toMatch(/^Candidate for /);
		expect(hero?.office).not.toMatch(/^Candidate for /);
		expect(hero?.tags).toEqual(['Incumbent', 'Candidate']);
	});

	test('a candidate-only hero has no second office line', () => {
		const view = getDevPersonProfileView('allen-slagle-74eee01a');
		const hero = buildPersonSectionOverrides(view!).component_profileHero;
		expect(hero?.secondaryOffice).toBeUndefined();
		expect(hero?.office).toMatch(/^Candidate for /);
	});
});

describe('breadcrumb', () => {
	test('dev profiles render the full location trail, not just Elections > Name', () => {
		const view = getDevPersonProfileView('allen-slagle-74eee01a');
		expect(view!.breadcrumb.map(crumb => crumb.label)).toEqual([
			'Elections',
			'Wyoming',
			'Laramie',
			'Springfield',
			'Springfield City Council',
			'Allen Slagle',
		]);
	});
});
