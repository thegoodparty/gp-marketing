import '~/testing/radixDialogServerRender';

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { PROFILE_HERO_INTRO_DEFAULTS } from '~/lib/profileHeroDefaults';
import { ProfileHeroSection } from './ProfileHeroSection';

/**
 * The hero's intro paragraph is a Studio field with a code default, keyed by
 * who the page is about. These pin the three things the wrapper decides:
 * which field is read, what stands in when the template has no value (every
 * Person Profile template saved before the field existed), and that the intro
 * is a /people thing — the legacy /candidate pages pass no subject and get none.
 *
 * Server-rendered: the wrapper is a server component and the pop-up trigger
 * inside the callout is Radix, hence the import on line one (see
 * `src/testing/radixDialogServerRender.ts`).
 */

type Props = Parameters<typeof ProfileHeroSection>[0];

const SECTION = { _type: 'component_profileHero', _key: 'hero' } as const;

const TOKENS = { '[candidate name]': 'DeVelle Jackson', '[office name]': 'U.S. House' };

function render(props: Partial<Props>): string {
	return renderToStaticMarkup(<ProfileHeroSection {...(SECTION as unknown as Props)} tokens={TOKENS} {...props} />);
}

function intro(html: string): string | null {
	const match = /<p[^>]*>(Learn about[^<]*)<\/p>/.exec(html);
	return match ? match[1]! : null;
}

describe('the hero intro paragraph', () => {
	test('a candidate page gets the candidate preset with the name filled in', () => {
		const html = render({
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Candidate for U.S. House', attribution: 'pledged', subject: 'candidate' },
		});

		expect(intro(html)).toBe(PROFILE_HERO_INTRO_DEFAULTS.candidate.replace('[candidate name]', 'DeVelle Jackson'));
		expect(intro(html)).toContain('DeVelle Jackson’s candidacy');
	});

	test('an elected official’s page gets the public-service preset', () => {
		const html = render({
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'U.S. House', attribution: 'notPledged', subject: 'elected official' },
		});

		expect(intro(html)).toBe(PROFILE_HERO_INTRO_DEFAULTS.officeholder.replace('[candidate name]', 'DeVelle Jackson'));
		expect(intro(html)).toContain('DeVelle Jackson’s public service');
		expect(intro(html)).not.toContain('candidacy');
	});

	test('words typed into Studio win, per subject, and still take the name token', () => {
		const props = {
			profileHeroContent: {
				field_introCandidates: 'Meet [candidate name], who is running.',
				field_introOfficeholders: 'Meet [candidate name], who serves.',
			},
		} as unknown as Partial<Props>;

		const candidate = render({
			...props,
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', attribution: 'pledged', subject: 'candidate' },
		});
		expect(candidate).toContain('Meet DeVelle Jackson, who is running.');
		expect(candidate).not.toContain('who serves');

		const official = render({
			...props,
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', attribution: 'pledged', subject: 'elected official' },
		});
		expect(official).toContain('Meet DeVelle Jackson, who serves.');
		expect(official).not.toContain('who is running');
	});

	test('a field cleared to whitespace falls back to the preset rather than rendering blank', () => {
		const html = render({
			...({ profileHeroContent: { field_introCandidates: '   ' } } as unknown as Partial<Props>),
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', attribution: 'pledged', subject: 'candidate' },
		});

		expect(intro(html)).toContain('DeVelle Jackson’s candidacy');
	});

	test('a page that names no subject (the legacy /candidate route) renders no intro and no callout', () => {
		const html = render({
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', isEmpowered: true },
		});

		expect(intro(html)).toBeNull();
		expect(html).not.toContain('ProfileHeroPledgeCallout');
		expect(html).toContain('Empowered by GoodParty.org');
	});
});

describe('the subject reaches the callout sentence', () => {
	test('an elected official is described as one', () => {
		const html = render({
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', attribution: 'pledgeIneligible', subject: 'elected official' },
		});

		expect(html).toContain('This elected official is ineligible for the ');
		expect(html).toContain('Read the full pledge');
	});

	test('a candidate is described as one', () => {
		const html = render({
			profileHeroOverride: { candidateName: 'DeVelle Jackson', office: 'Office', attribution: 'notPledged', subject: 'candidate' },
		});

		expect(html).toContain('This candidate has not yet taken the ');
	});
});
