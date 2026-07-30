/**
 * Person-profile (/people/<slug>) template section layout — Option A.
 *
 * The public person page is now template-driven (like /candidate): this ordered
 * section list is the code default + Sanity global-template seed for the
 * `personProfile` election-template type. Editors clone it into per-state Custom
 * Templates (see field_profileState) to tune copy/sections per Figma state A–L.
 *
 * Data-only (no component imports) so it is safe to import from the Sanity seed
 * script and the code-default resolver. Dynamic per-person data is injected at
 * render time via `buildPersonSectionOverrides` (see personSectionOverrides.tsx),
 * keyed by the section `_key`s below.
 */
import type { Sections } from '~/PageSections';
import { PROFILE_PAGE_SECTIONS } from '~/app/candidate/[...slug]/profilePageSections';

/** Stable section `_key`s for per-`_key` overrides. */
export const PERSON_SECTION_KEYS = {
	breadcrumb: 'person-breadcrumb',
	hero: 'person-hero',
	claim: 'person-claim',
	content: 'person-content',
	pledge: 'person-pledge',
	elections: 'person-elections',
	cta: 'person-cta',
} as const;

// Reuse the already-valid profile skeletons (breadcrumb/hero/claim/content/pledge)
// from the candidate profile layout; person profiles add the two interlink
// candidate lists, a state elections index, and a sign-up CTA banner.
const byType = (type: string) => PROFILE_PAGE_SECTIONS.find(s => s._type === type);

const breadcrumbSkeleton = byType('component_breadcrumbBlock');
const heroSkeleton = byType('component_profileHero');
const claimSkeleton = byType('component_claimProfileBlock');
const contentSkeleton = byType('component_profileContentBlock');
const pledgeSkeleton = byType('component_goodPartyOrgPledge');

// Order mirrors the Figma person-profile states:
//   breadcrumb → hero → claim (unclaimed only) → content well → sign-up CTA →
//   GoodParty pledge (claimed candidate/both) → elections index.
// The Figma content well is a two-column layout (left contact/office sidebar +
// right card stack). The right stack — authored cards, Recent Experience, the
// in-column "Other candidates" list, the About-position card, and the District
// Information map — is all composed inside `component_profileContentBlock` (see
// buildPersonSectionOverrides), NOT as separate full-width sections, so it
// matches the Figma single-column-of-cards layout. Editors can reorder per-state
// in Sanity.
export const PERSON_PROFILE_SECTIONS = [
	{ ...breadcrumbSkeleton, _key: PERSON_SECTION_KEYS.breadcrumb },
	{ ...heroSkeleton, _key: PERSON_SECTION_KEYS.hero },
	{ ...claimSkeleton, _key: PERSON_SECTION_KEYS.claim },
	{ ...contentSkeleton, _key: PERSON_SECTION_KEYS.content },
	{
		_key: PERSON_SECTION_KEYS.cta,
		_type: 'component_ctaBannerBlock',
		field_ctaType: 'Manual',
		smallCtaMessaging: {
			field_title: 'Join the movement to build a better democracy.',
			block_summaryText: [
				{
					_key: 'person-cta-copy',
					_type: 'block',
					children: [
						{
							_key: 'person-cta-span',
							_type: 'span',
							marks: [],
							text: 'GoodParty.org helps everyday people run for office and win — free from big money and party bosses. Join us.',
						},
					],
					markDefs: [],
					style: 'normal',
				},
			],
		},
		ctaAction: {
			_type: 'ctaAction',
			field_buttonText: 'Get started',
			field_ctaActionWithShared: 'SignUp',
		},
		ctaBannerBlockDesignSettings: {
			field_blockColorCreamMidnight: 'Cream',
			field_componentColor6ColorsInverse: 'Blue',
		},
	},
	{ ...pledgeSkeleton, _key: PERSON_SECTION_KEYS.pledge },
	{
		_key: PERSON_SECTION_KEYS.elections,
		_type: 'component_electionsIndexBlock',
		electionsIndexBlockDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
			field_showSearch: false,
		},
	},
] as unknown as Sections[];
