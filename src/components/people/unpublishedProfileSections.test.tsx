/**
 * Pins the one behaviour that separates an unpublished profile from an
 * unclaimed one: no claim affordances.
 *
 * The bug this guards was invisible from the API layer — gp-api 404'd for both
 * "never claimed" and "unpublished", so a person who deliberately hid their own
 * profile got "Are you [Name]?" on their own page, plus a card asking voters to
 * pester them into finishing it. Asserting on `view.unpublished` alone would not
 * have caught it, because the flag is only worth anything if the section builder
 * reads it. So these assertions read the composed section overrides.
 *
 * Structure is compared against the `absent` view of the SAME fixture rather
 * than a hand-written list of expected cards: the point is that unpublished
 * differs from unclaimed in exactly one respect, and a literal list would go
 * stale the next time the civics spine gains a card.
 */
import { describe, expect, test } from 'bun:test';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
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

/**
 * Every string rendered inside a section, including deep inside the claim
 * prompt components, so a claim CTA cannot hide behind a nested element.
 */
function collectText(node: ReactNode): string[] {
	if (node == null || typeof node === 'boolean') return [];
	if (typeof node === 'string' || typeof node === 'number') return [String(node)];
	if (Array.isArray(node)) return node.flatMap(child => collectText(child as ReactNode));
	if (isValidElement(node)) {
		const el = node as ReactElement<Record<string, unknown>>;
		const props = el.props ?? {};
		// Component elements are not rendered here, so their copy lives in props
		// (displayName, variant, heading, …) rather than in children.
		return Object.entries(props).flatMap(([key, value]) =>
			key === 'children' || typeof value !== 'string' ? collectText(value as ReactNode) : [value],
		);
	}
	return [];
}

function cardShapes(view: PersonProfileView): string[] {
	const overrides = buildPersonSectionOverrides(view);
	return (overrides.component_profileContentBlock?.contentCards ?? []).map(
		card => card.heading ?? (card.raw ? 'raw' : (card.cardType ?? 'untitled')),
	);
}

function claimPromptVariants(view: PersonProfileView): string[] {
	const overrides = buildPersonSectionOverrides(view);
	return (overrides.component_profileContentBlock?.contentCards ?? [])
		.flatMap(card => collectText(card.content))
		.filter(text => text === 'owner-card' || text === 'voter-card');
}

describe('an unpublished profile suppresses every claim affordance', () => {
	for (const fixture of UNPUBLISHED_FIXTURES) {
		describe(fixture.description, () => {
			const view = viewForFixture(fixture);

			test('renders no owner or voter claim prompt card', () => {
				expect(claimPromptVariants(view)).toEqual([]);
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
				expect(hero?.attribution).toBe('notEndorsed');
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
