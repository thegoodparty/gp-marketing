/**
 * The sentences GoodParty.org publishes about a named person, shared by every
 * surface that makes one.
 *
 * Marketing replaced the claim-keyed "Empowered by GoodParty.org" framing on the
 * `/people` profiles with the three pledge statements on 2026-08-17 (approved by
 * Emily and Jack; `pledgeAttributionCopy.test.tsx` pins the wording). The hero
 * was rewritten and the related-person cards on the same page were missed, so
 * the retired sentence went on being published about six other named people per
 * profile. These live in one place now: a surface can only fall behind a copy
 * decision if it holds its own copy.
 */
export type AttributionMode =
	| 'empowered'
	| 'pledged'
	| 'notPledged'
	| 'pledgeIneligible'
	| 'none';

export const ATTRIBUTION_COPY: Record<Exclude<AttributionMode, 'none'>, string> = {
	empowered: 'Empowered by GoodParty.org',
	pledged: 'Has Taken the GoodParty.org Pledge',
	notPledged: 'Has Not Taken the GoodParty.org Pledge',
	pledgeIneligible: 'Ineligible for the GoodParty.org Pledge Due to Partisan Affiliation',
};
