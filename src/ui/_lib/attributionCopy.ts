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
 *
 * Recased to sentence case on 2026-09-15 (Emily). The assertions are unchanged —
 * "Has not taken…" claims exactly what "Has Not Taken…" did — so the reasoning
 * about what these lines assert about real people still holds.
 */
export type AttributionMode =
	| 'empowered'
	| 'pledged'
	| 'notPledged'
	| 'pledgeIneligible'
	| 'none';

export const ATTRIBUTION_COPY: Record<Exclude<AttributionMode, 'none'>, string> = {
	empowered: 'Empowered by GoodParty.org',
	pledged: 'Has taken the GoodParty.org Pledge',
	notPledged: 'Has not taken the GoodParty.org Pledge',
	pledgeIneligible: 'Ineligible for the GoodParty.org Pledge due to partisan affiliation',
};

/**
 * The name of the pledge inside the three pledge lines. Surfaces that link the
 * line to the pledge itself link this phrase alone, not the whole sentence: the
 * sentence is a statement about a person, and only the name of the pledge is the
 * thing being pointed at.
 *
 * Stays title case while the sentences around it are sentence case — it is the
 * pledge's name, not prose.
 */
export const ATTRIBUTION_PLEDGE_PHRASE = 'GoodParty.org Pledge';

/**
 * The pledge callout that replaced the one-line status in the Profile Hero
 * (Voter Guide frames, Emily, 2026-10-06). Still a statement about a named
 * person, so the same rules hold: the wording is marketing's, not ours to tidy,
 * and the negative and ineligible lines say exactly what they say.
 *
 * The frames only draw candidates. For someone who holds or held office the
 * subject is "elected official" (Emily, 2026-10-06); the rest of each sentence
 * is unchanged.
 */
export type PledgeCalloutMode = Extract<AttributionMode, 'pledged' | 'notPledged' | 'pledgeIneligible'>;

export type PledgeSubject = 'candidate' | 'elected official';

export const PLEDGE_CALLOUT_LINK_LABEL = 'Read the full pledge';

export function pledgeCalloutCopy(mode: PledgeCalloutMode, subject: PledgeSubject): string {
	switch (mode) {
		case 'pledged':
			return `This ${subject} took the ${ATTRIBUTION_PLEDGE_PHRASE}, promising to serve people first, independent of both major parties and big-money interests.`;
		case 'notPledged':
			return `This ${subject} has not yet taken the ${ATTRIBUTION_PLEDGE_PHRASE} to serve people first, independent of both major parties and big-money interests.`;
		case 'pledgeIneligible':
			return `This ${subject} is ineligible for the ${ATTRIBUTION_PLEDGE_PHRASE} due to partisan affiliation.`;
	}
}
