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
import { buildBreadcrumbTrail } from '~/lib/peopleProfile';
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

	/**
	 * The prompt is the only content card handed a person and a place, so it is
	 * identified by its props rather than by importing the component — this suite
	 * runs without a DOM and the component pulls in Radix.
	 */
	function claimPrompts(slug: string): { locationLabel?: unknown }[] {
		return contentCards(slug).flatMap(card => {
			const props = (card.content as { props?: Record<string, unknown> } | undefined)?.props;
			return props && 'personId' in props && 'locationLabel' in props ? [props] : [];
		});
	}

	function rendersClaimBand(slug: string): boolean {
		const view = getDevPersonProfileView(slug);
		if (!view) throw new Error(`no dev fixture for ${slug}`);
		const cta = buildPersonSectionOverrides(view).component_ctaBannerBlock as { render?: unknown } | undefined;
		return cta?.render !== undefined;
	}

	/**
	 * The prompt asks a visitor to nudge the person; the band is where that
	 * person actually claims. Both hang off the same `showClaim` gate today, and
	 * a page carrying one without the other is incoherent either way — a nudge
	 * leading nowhere, or a claim form on a page that never mentions claiming.
	 */
	test('no state renders the claim prompt without the claim band below it', () => {
		for (const slug of ALL_STATES) {
			expect([slug, claimPrompts(slug).length > 0]).toEqual([slug, rendersClaimBand(slug)]);
		}
	});

	/**
	 * The frames put exactly ONE card at the top of the content well and it is
	 * visitor-facing (D 1958:108619, F 1928:100987). An owner-facing "are you
	 * [Name]?" prompt was added alongside it once and had to be taken back out;
	 * this is what stops a second one reappearing.
	 *
	 * State E is absent on purpose: an unclaimed officeholder is no longer asked
	 * to claim anything (see the office-only gating below), so it has no prompt
	 * to count.
	 */
	test('the unclaimed states lead with exactly one claim prompt', () => {
		for (const slug of ['kim-byrd-b77f912d', 'tim-ficken-0a951485']) {
			expect([slug, claimPrompts(slug).length]).toEqual([slug, 1]);
		}
	});

	// A claimed profile has nothing to claim, and a removed one asked us to stop.
	test('claimed and removed states show no prompt', () => {
		for (const slug of ['allen-slagle-74eee01a', 'x-27255f40', 'x-3412f69c']) {
			expect([slug, claimPrompts(slug).length]).toEqual([slug, 0]);
		}
	});

	function promptLocation(cards: ReturnType<typeof contentCards>): unknown {
		return cards
			.map(card => (card.content as { props?: Record<string, unknown> } | undefined)?.props)
			.find(props => props && 'personId' in props && 'locationLabel' in props)?.['locationLabel'];
	}

	/**
	 * The prompt for someone in office opens "[Location] deserves greater
	 * transparency" (Figma E 1928:99467, F 1928:100987). Nothing on the view is
	 * that place — `districtLabel` is a ward, `stateLabel` a two-letter code — so
	 * it is read back off the breadcrumb, and picking the wrong crumb would name
	 * the state, or the office, where the frame names the town.
	 */
	test('the prompt is handed the most specific place in the breadcrumb', () => {
		for (const slug of ['kim-byrd-b77f912d', 'tim-ficken-0a951485']) {
			expect([slug, promptLocation(contentCards(slug))]).toEqual([slug, 'Springfield']);
		}
	});

	/**
	 * The dev fixtures hand every persona a city race, but in production a
	 * candidacy can arrive without a slug, leaving no race for the trail to hang
	 * off, and it degrades to `Elections > State > Name`. The card then names the
	 * state. That is the accepted degradation (see `profileLocationLabel`) — what
	 * must not happen is the state crumb being skipped for the office, or dropped
	 * for the generic subject, so this pins the degraded shape rather than
	 * assuming the fixtures represent it.
	 *
	 * Driven from state F rather than E: the office-only persona no longer renders
	 * a prompt for the label to reach.
	 */
	test('a profile with no race falls back to the state, not the office', () => {
		const view = getDevPersonProfileView('tim-ficken-0a951485');
		if (!view) throw new Error('no dev fixture for tim-ficken-0a951485');
		const stateOnly = {
			...view,
			breadcrumb: buildBreadcrumbTrail({
				displayName: view.displayName,
				stateCode: 'WY',
				raceSlug: null,
				positionLevel: null,
				positionName: null,
			}),
		};
		const cards = buildPersonSectionOverrides(stateOnly).component_profileContentBlock?.contentCards ?? [];
		expect(promptLocation(cards)).toBe('Wyoming');
	});
});

/**
 * Marketing removed the claim CTAs from elected-official-only pages (Slack,
 * 2026-08-17) — someone who only holds office has no self-serve product to be
 * sent to. The gate reads `persona !== 'officeholder'`, and the persona that is
 * easy to lose is 'both': `resolvePersona` returns it for someone currently in
 * office AND running now, and they keep the candidate treatment because they
 * have a live candidacy to claim into. Nothing else in the file distinguishes
 * the two, so a future reading of "elected officials" as "anyone in office"
 * would silently take state F's CTAs with it.
 */
describe('claim CTAs are gone from the office-only pages and nowhere else', () => {
	function claimSurfaces(slug: string): { prompts: number; band: boolean } {
		const view = getDevPersonProfileView(slug);
		if (!view) throw new Error(`no dev fixture for ${slug}`);
		const overrides = buildPersonSectionOverrides(view);
		const cta = overrides.component_ctaBannerBlock as { render?: unknown } | undefined;
		return {
			// Identified the same way `claimPrompts` does it above: the prompt is the
			// only card handed both a `personId` and a `locationLabel`. This used to
			// key on a `variant` prop, which went with the owner card — and a filter
			// on a prop that no longer exists counts zero on every page, which reads
			// as "the CTAs are gone" no matter what actually rendered.
			prompts: (overrides.component_profileContentBlock?.contentCards ?? []).filter(card => {
				const props = (card.content as { props?: Record<string, unknown> } | undefined)?.props;
				return Boolean(props && 'personId' in props && 'locationLabel' in props);
			}).length,
			band: cta?.render !== undefined,
		};
	}

	test('state E — an unclaimed officeholder is asked for nothing', () => {
		expect(getDevPersonProfileView('rob-zotti-d8c578fb')?.persona).toBe('officeholder');
		expect(claimSurfaces('rob-zotti-d8c578fb')).toEqual({ prompts: 0, band: false });
	});

	test('state E falls through to no CTA band at all, not the claimed sign-up one', () => {
		const view = getDevPersonProfileView('rob-zotti-d8c578fb');
		if (!view) throw new Error('no dev fixture for rob-zotti-d8c578fb');
		expect(buildPersonSectionOverrides(view).component_ctaBannerBlock).toEqual({ hidden: true });
	});

	test('states D and F — running, so still asked to claim', () => {
		expect(getDevPersonProfileView('kim-byrd-b77f912d')?.persona).toBe('candidate');
		expect(getDevPersonProfileView('tim-ficken-0a951485')?.persona).toBe('both');
		expect(claimSurfaces('kim-byrd-b77f912d')).toEqual({ prompts: 1, band: true });
		expect(claimSurfaces('tim-ficken-0a951485')).toEqual({ prompts: 1, band: true });
	});

	test('state E keeps its civics spine — this removed the ask, not the page', () => {
		const headings = sectionHeadings('rob-zotti-d8c578fb');
		expect(headings).toContain('Recent Experience');
		expect(headings).toContain('District information');
		expect(headings).toContain('Nearby Officials');
	});
});

/**
 * The hero attribution line. Marketing's spec keyed the pledge copy off CLAIM
 * status; these pin it to the pledge flag instead, because they are separate
 * facts (see `pledgeAttribution`). State B is the case that proves it: a claimed
 * officeholder is `pledged: false` in the shared matrix, because `isPledged`
 * only ever rolls up from candidacies, so the literal spec would have published
 * "Has Taken the GoodParty.org Pledge" about them.
 */
describe('the hero states the pledge fact, not the claim', () => {
	const EXPECTED: Array<[string, string, string | undefined]> = [
		['A', 'allen-slagle-74eee01a', 'pledged'],
		['B', 'tracy-good-ecff49d3', 'notPledged'],
		['C', 'susan-overman-ad914b82', 'pledged'],
		['D', 'kim-byrd-b77f912d', 'notPledged'],
		['E', 'rob-zotti-d8c578fb', 'notPledged'],
		['F', 'tim-ficken-0a951485', 'notPledged'],
		['G', 'bill-fortner-61a42912', 'notPledged'],
		['H', 'gregory-schreurs-136cadf0', 'notPledged'],
		['I', 'jeb-hanson-3753676b', 'pledgeIneligible'],
		['J', 'deb-craft-f88e7434', 'pledgeIneligible'],
		['K', 'x-27255f40', 'none'],
		['L', 'x-3412f69c', 'none'],
	];

	function hero(slug: string) {
		const view = getDevPersonProfileView(slug);
		if (!view) throw new Error(`no dev fixture for ${slug}`);
		return buildPersonSectionOverrides(view).component_profileHero;
	}

	test('every state resolves to its intended line', () => {
		for (const [state, slug, attribution] of EXPECTED) {
			expect([state, hero(slug)?.attribution]).toEqual([state, attribution]);
		}
	});

	test('state B — claimed, but the flag says they have not pledged', () => {
		const view = getDevPersonProfileView('tracy-good-ecff49d3');
		// Guards the premise. If a fixture change ever makes this person pledged,
		// the assertion above stops testing the divergence and starts agreeing with
		// the literal spec by accident.
		expect([view?.claimed, view?.pledged]).toEqual([true, false]);
	});

	test('the other divergence — unclaimed, but they did take the pledge', () => {
		// The bug behind this whole decision: pledged people showing up on
		// unclaimed pages. No fixture carries the combination (the unclaimed
		// fixtures leave the spine flag off), so it is composed here rather than
		// left untested.
		const view = getDevPersonProfileView('kim-byrd-b77f912d');
		if (!view) throw new Error('no dev fixture for kim-byrd-b77f912d');
		const hero = buildPersonSectionOverrides({ ...view, pledged: true }).component_profileHero;
		expect(hero?.attribution).toBe('pledged');
		// Still unclaimed, so the page carries no GoodParty.org mark: the line
		// reports a fact about the person, the mark says whose profile this is.
		expect(hero?.showBrandMark).toBe(false);
	});

	test('a major-party page says ineligible even if the spine flags a pledge', () => {
		// A stale flag from a run under another party must not outrank the party
		// the page currently reports — the two lines would contradict each other.
		const view = getDevPersonProfileView('jeb-hanson-3753676b');
		if (!view) throw new Error('no dev fixture for jeb-hanson-3753676b');
		expect(buildPersonSectionOverrides({ ...view, pledged: true }).component_profileHero?.attribution).toBe(
			'pledgeIneligible',
		);
	});

	test('the GoodParty.org mark still follows the claim, not the pledge', () => {
		// Every claimed officeholder is unpledgeable, so keying the mark on the
		// pledge would strip the branding off a whole persona's claimed profiles.
		for (const [state, slug] of [['A', 'allen-slagle-74eee01a'], ['B', 'tracy-good-ecff49d3'], ['G', 'bill-fortner-61a42912']] as const) {
			expect([state, hero(slug)?.showBrandMark]).toEqual([state, true]);
		}
		for (const [state, slug] of [['D', 'kim-byrd-b77f912d'], ['I', 'jeb-hanson-3753676b'], ['K', 'x-27255f40']] as const) {
			expect([state, hero(slug)?.showBrandMark]).toEqual([state, false]);
		}
	});
});

/**
 * The removal states (Figma K 1997:118776 / desktop 1997:118777, L 1997:118282 /
 * desktop 1997:118283) are the two frames with a legal obligation behind them:
 * someone asked us to stop publishing their profile, and we kept the crawlable
 * civics spine on the understanding that everything they or we authored comes
 * off. Nothing pinned that, so any of it could have been restored by a change
 * aimed at another state — the authored slot, the hero photo, the pledge badge
 * and the contact links are all shared code paths.
 *
 * These assert on absence, which is exactly what a visual diff is worst at: the
 * harness scores K/L on a blurred layout metric where a re-appearing avatar or
 * pledge pill is a rounding error.
 */
describe('the removal states publish the civics spine and nothing else', () => {
	const REMOVAL_SLUGS = [
		['K', 'x-27255f40'],
		['L', 'x-3412f69c'],
	] as const;

	/** Every authored section a claimed page can render, in any persona. */
	const AUTHORED_HEADINGS = [
		'Why I\u2019m Running for Office',
		'Why I Served',
		'Campaign Issues',
		'Top Priorities While in Office',
		'Accomplishments During This Term',
		'About Me',
	];

	test('state K — a removed candidate keeps only the public record', () => {
		expect(sectionHeadings('x-27255f40')).toEqual([
			'Recent Experience',
			'Other Candidates for Springfield City Council',
			'About Springfield City Council',
			'District information',
		]);
	});

	test('state L — a removed officeholder keeps only the public record', () => {
		expect(sectionHeadings('x-3412f69c')).toEqual([
			'Recent Experience',
			'District information',
			'About Springfield City Council',
			'Nearby Officials',
		]);
	});

	test('neither removal state renders a single authored section', () => {
		for (const [state, slug] of REMOVAL_SLUGS) {
			const headings = sectionHeadings(slug);
			for (const authored of AUTHORED_HEADINGS) {
				expect([state, authored, headings.includes(authored)]).toEqual([state, authored, false]);
			}
		}
	});

	test('the removal frames carry no card without a heading', () => {
		// The claim prompts are the only chrome-less `raw` cards in the well, and
		// `claimPrompts` above already pins that they are gone. This catches
		// a future raw card (a banner, a notice) being added to every unclaimed
		// page and silently landing on a page we are meant to have stripped.
		for (const [state, slug] of REMOVAL_SLUGS) {
			expect([state, contentCards(slug).filter(card => !card.heading)]).toEqual([state, []]);
		}
	});

	test('the hero is stripped of the photo and says nothing about the pledge', () => {
		// This asserted `notEndorsed` when it was written. The pledge copy replaced
		// that line, and removal now resolves to no line at all rather than "Has
		// Not Taken the GoodParty.org Pledge": `pledged` is force-cleared on
		// removal, so the negative would be a claim we cannot stand behind, made
		// about the one group who asked us to stop publishing them.
		for (const [state, slug] of REMOVAL_SLUGS) {
			const view = getDevPersonProfileView(slug);
			if (!view) throw new Error(`no dev fixture for ${slug}`);
			const hero = buildPersonSectionOverrides(view).component_profileHero;
			expect([state, hero?.profileImageUrl]).toEqual([state, undefined]);
			expect([state, hero?.isEmpowered]).toEqual([state, false]);
			expect([state, hero?.attribution]).toEqual([state, 'none']);
		}
	});

	test('the pledge badge is suppressed even though the spine still flags it', () => {
		// Both removal fixtures seed `isPledged: true`. Pledging is a factual civics
		// flag, so the only reason it does not paint is the removal — making this
		// the one assertion that would catch removal being dropped from `pledged`.
		for (const [state, slug] of REMOVAL_SLUGS) {
			expect([state, getDevPersonProfileView(slug)?.pledged]).toEqual([state, false]);
		}
	});

	test('the CTA band is hidden rather than swapped for the generic sign-up', () => {
		for (const [state, slug] of REMOVAL_SLUGS) {
			const view = getDevPersonProfileView(slug);
			if (!view) throw new Error(`no dev fixture for ${slug}`);
			expect([state, buildPersonSectionOverrides(view).component_ctaBannerBlock]).toEqual([
				state,
				{ hidden: true },
			]);
		}
	});

	test('the sidebar keeps the persona facts and drops every way to contact them', () => {
		// Contact icons, office email/phone and the mailing address all hang off
		// `view.links` / `view.officeAddress`, which removal empties. The office
		// address in particular is a home-adjacent detail on a page the subject
		// asked us to take down.
		for (const [state, slug] of REMOVAL_SLUGS) {
			const view = getDevPersonProfileView(slug);
			if (!view) throw new Error(`no dev fixture for ${slug}`);
			const sidebar = buildPersonSectionOverrides(view).component_profileContentBlock?.sidebar;
			expect([state, sidebar?.contactIcons ?? []]).toEqual([state, []]);
			expect([state, sidebar?.officeContacts ?? []]).toEqual([state, []]);
			expect([state, sidebar?.officeAddress ?? []]).toEqual([state, []]);
			// Party is public record and stays — losing it would be over-stripping.
			expect([state, Boolean(sidebar?.politicalAffiliation)]).toEqual([state, true]);
		}
	});

	test('K shows its election date; L, who is not running, does not', () => {
		// The Figma removal frames are one generic template that shows both rows on
		// both states (logged in harness/FOLLOWUPS.md as a reference artifact), so
		// the harness cannot arbitrate this. Persona correctness is pinned here.
		const rowLabels = (slug: string) => {
			const view = getDevPersonProfileView(slug);
			if (!view) throw new Error(`no dev fixture for ${slug}`);
			const sidebar = buildPersonSectionOverrides(view).component_profileContentBlock?.sidebar;
			return (sidebar?.topInfos ?? []).map(info => info.label);
		};
		expect(rowLabels('x-27255f40')).toEqual(['Election Date']);
		expect(rowLabels('x-3412f69c')).toEqual([]);
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
