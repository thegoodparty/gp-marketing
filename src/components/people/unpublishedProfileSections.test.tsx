/**
 * Pins the one behaviour that separates an unpublished profile from an
 * unclaimed one: no claim affordances.
 *
 * The bug this guards was invisible from the API layer — gp-api 404'd for both
 * "never claimed" and "unpublished", so a person who deliberately hid their own
 * profile got "Are you [Name]?" on their own page. Asserting on `view.unpublished` alone would not
 * have caught it, because the flag is only worth anything if the section builder
 * reads it. So these assertions read the composed section overrides.
 *
 * Structure is compared against the `absent` view of the SAME fixture rather
 * than a hand-written list of expected cards: the point is that unpublished
 * differs from unclaimed in exactly one respect, and a literal list would go
 * stale the next time the civics spine gains a card.
 */
import { describe, expect, test } from 'bun:test';
import { buildPersonSectionOverrides } from './personSectionOverrides';
import {
	composeView,
	type PersonProfileView,
} from '~/lib/peopleProfile';
import {
	PERSON_ID,
	UNPUBLISHED_FIXTURES,
	viewForFixture,
	type StateFixture,
} from '~/testing/peopleProfileFixtures';

/** The same spine with no overlay at all — a person nobody has claimed. */
function absentView(fixture: StateFixture): PersonProfileView {
	return composeView(PERSON_ID, fixture.person, null, {});
}

function cardShapes(view: PersonProfileView): string[] {
	const overrides = buildPersonSectionOverrides(view);
	return (overrides.component_profileContentBlock?.contentCards ?? []).map(
		card => card.heading ?? (card.raw ? 'raw' : (card.cardType ?? 'untitled')),
	);
}

function rendersClaimBlock(view: PersonProfileView): boolean {
	return buildPersonSectionOverrides(view).component_claimProfileBlock?.claimed === false;
}

describe('an unpublished profile suppresses every claim affordance', () => {
	for (const fixture of UNPUBLISHED_FIXTURES) {
		describe(fixture.description, () => {
			const view = viewForFixture(fixture);

			test('renders no claim block', () => {
				expect(rendersClaimBlock(view)).toBe(false);
			});

			// Proves the assertion above is doing work: the same person, merely
			// unclaimed rather than unpublished, gets the block, unless the spine was
			// never empowered or is not running (a major-party, office-only or past
			// page has no claim surfaces in either state).
			test('the equivalent unclaimed profile gets one whenever it is empowered and running', () => {
				const absent = absentView(fixture);
				const running = absent.persona === 'candidate' || absent.persona === 'both';
				expect(rendersClaimBlock(absent)).toBe(absent.empowered && running);
			});

			test('hides the CTA band instead of offering the claim form', () => {
				expect(buildPersonSectionOverrides(view).component_ctaBannerBlock).toEqual({ hidden: true });
			});

			test('drops the "once they claim their profile" placeholder cards', () => {
				const text = cardShapes(view).join(' ');
				expect(text).not.toContain('Why');
				expect(text).not.toContain('About');
			});

			test('keeps the hero neutral rather than claiming endorsement', () => {
				const hero = buildPersonSectionOverrides(view).component_profileHero;
				// This asserted the 'notEndorsed' line, which the pledge copy replaced.
				// What has to hold is unchanged: unpublishing must not promote the
				// page, so the hero reads exactly as the equivalent unclaimed one — and
				// the GoodParty.org mark, which follows the claim, stays off.
				const absent = buildPersonSectionOverrides(absentView(fixture)).component_profileHero;
				expect(hero?.attribution).toBe(absent?.attribution);
				expect(hero?.showBrandMark).toBe(false);
			});
		});
	}
});

describe('an unpublished profile is otherwise the unclaimed page', () => {
	for (const fixture of UNPUBLISHED_FIXTURES) {
		test(`${fixture.description} keeps its civics spine`, () => {
			const unpublished = cardShapes(viewForFixture(fixture));
			const absent = cardShapes(absentView(fixture));

			// The civics spine is the public record, which the person unpublishing
			// their profile does not retract — unlike a removal (K/L), which does.
			expect(unpublished).toContain('Recent Experience');
			// Nothing is invented: unpublished only ever drops cards.
			expect(absent).toEqual(expect.arrayContaining(unpublished));

			// Claim prompts and their authored placeholders only exist on the
			// empowered branch, so that is the only branch where the column shrinks.
			// The major-party fixture is here to prove the suppression is keyed on
			// `unpublished` and not silently riding on `empowered`.
			if (fixture.expected.empowered) {
				expect(unpublished.length).toBeLessThan(absent.length);
			} else {
				expect(unpublished).toEqual(absent);
			}
		});
	}
});
