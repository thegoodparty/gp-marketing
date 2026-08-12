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
			'Other Candidates for Springfield City Council',
			'About Springfield City Council',
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

describe('unclaimed pages prompt for every section the claimed page would show', () => {
	/**
	 * The unclaimed frames (D 1917:88035, E 1917:88616, F 1917:89211,
	 * H 1970:113629) carry a prompt per authored section, so a persona must not
	 * lose one just because nobody has written it yet.
	 */
	test('state F — serving and running prompts for campaign AND in-office sections', () => {
		// Guards the premise: if this fixture ever becomes claimed the assertions
		// below would pass on authored content and stop testing the placeholders.
		expect(getDevPersonProfileView('tim-ficken-0a951485')?.claimed).toBe(false);
		const headings = sectionHeadings('tim-ficken-0a951485');
		expect(headings).toContain('Campaign Issues');
		expect(headings).toContain('Top Priorities While in Office');
		expect(headings).toContain('Accomplishments During This Term');
	});

	test('state E — an officeholder prompts for their in-office record, not a campaign', () => {
		const headings = sectionHeadings('rob-zotti-d8c578fb');
		expect(headings).toContain('Top Priorities While in Office');
		expect(headings).toContain('Accomplishments During This Term');
		expect(headings).not.toContain('Campaign Issues');
	});

	test('state D — a candidate is never prompted for an in-office record', () => {
		const headings = sectionHeadings('kim-byrd-b77f912d');
		expect(headings).toContain('Campaign Issues');
		expect(headings).not.toContain('Top Priorities While in Office');
		expect(headings).not.toContain('Accomplishments During This Term');
	});
});

describe('the claim prompt and the claim form ship together', () => {
	/** Every Figma state A–L, so no state can render one half of the pair. */
	const ALL_STATES = [
		'allen-slagle-74eee01a',
		'tracy-good-ecff49d3',
		'susan-overman-ad914b82',
		'kim-byrd-b77f912d',
		'rob-zotti-d8c578fb',
		'tim-ficken-0a951485',
		'bill-fortner-61a42912',
		'gregory-schreurs-136cadf0',
		'jeb-hanson-3753676b',
		'deb-craft-f88e7434',
		'x-27255f40',
		'x-3412f69c',
	];

	function claimPromptVariants(slug: string): string[] {
		return contentCards(slug).flatMap(card => {
			const variant = (card.content as { props?: { variant?: string } } | undefined)?.props?.variant;
			return variant ? [variant] : [];
		});
	}

	function rendersClaimBand(slug: string): boolean {
		const view = getDevPersonProfileView(slug);
		if (!view) throw new Error(`no dev fixture for ${slug}`);
		const cta = buildPersonSectionOverrides(view).component_ctaBannerBlock as { render?: unknown } | undefined;
		return cta?.render !== undefined;
	}

	/**
	 * The owner prompt's button scrolls to `#person-claim-form`, and that anchor
	 * only exists inside PersonClaimCTABand. Both hang off the same `showClaim`
	 * gate today; this pins the pairing so a future change to either gate cannot
	 * quietly leave the button scrolling to nothing.
	 */
	test('no state renders the owner claim prompt without the claim form below it', () => {
		for (const slug of ALL_STATES) {
			expect([slug, claimPromptVariants(slug).includes('owner-card')]).toEqual([slug, rendersClaimBand(slug)]);
		}
	});

	test('the unclaimed states lead with the owner prompt, then the voter prompt', () => {
		for (const slug of ['kim-byrd-b77f912d', 'rob-zotti-d8c578fb', 'tim-ficken-0a951485']) {
			expect([slug, claimPromptVariants(slug)]).toEqual([slug, ['owner-card', 'voter-card']]);
		}
	});

	// A claimed profile has nothing to claim, and a removed one asked us to stop.
	test('claimed and removed states show neither prompt', () => {
		for (const slug of ['allen-slagle-74eee01a', 'x-27255f40', 'x-3412f69c']) {
			expect([slug, claimPromptVariants(slug)]).toEqual([slug, []]);
		}
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
			['Other Candidates for Springfield City Council'],
			['About Springfield City Council'],
			['District information'],
		]);
	});

	test('accomplishments sit under the in-office priorities, not beside them', () => {
		expect(headingsByCard('tracy-good-ecff49d3')[0]).toEqual([
			'Top Priorities While in Office',
			'Accomplishments During This Term',
		]);
	});

	test('state C keeps campaign issues and the in-office record in separate cards', () => {
		// The original regression: both issue sections shared a group and merged
		// into one card. sectionHeadings alone cannot catch that — it flattens.
		const cards = headingsByCard('susan-overman-ad914b82');
		expect(cards).toContainEqual(['Why I\u2019m Running for Office', 'Campaign Issues']);
		expect(cards).toContainEqual([
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
		// The position link belongs to the race being run, so it moves to the
		// candidacy line and the held-office line above it stays unlinked.
		expect(hero?.officeHref).toBeUndefined();
		expect(hero?.secondaryOfficeHref).toContain('/elections/');
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

	test('every dev persona names one office in the trail, the hero, and the sections', () => {
		for (const slug of ['allen-slagle-74eee01a', 'tracy-good-ecff49d3', 'susan-overman-ad914b82', 'bill-fortner-61a42912']) {
			const view = getDevPersonProfileView(slug);
			const positionCrumb = view!.breadcrumb.at(-2)?.label;
			expect(positionCrumb).toBe(view!.officeName ?? undefined);
			expect(sectionHeadings(slug)).toContain(`About ${positionCrumb}`);
		}
	});
});
