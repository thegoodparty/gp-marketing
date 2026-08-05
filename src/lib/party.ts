// Party classification for the public /people profiles. The Figma designs gate
// two-party (Republican / Democrat) unclaimed pages (states I/J) differently
// from independent / third-party / nonpartisan ones (states D–H): the major-
// party pages omit the GoodParty.org empowerment framing and pledge. This
// normalizes the free-text party strings election-api carries
// (Candidacy.party, OfficeHolder.partyNames[]) into a small enum.

export type PartyClass = 'republican' | 'democrat' | 'independent' | 'other';

const REPUBLICAN_RE = /\b(republican|gop|rep\.?)\b|^r$/i;
const DEMOCRAT_RE = /\b(democrat(ic)?|dem\.?)\b|^d$/i;
const INDEPENDENT_RE =
	/\b(independent|nonpartisan|non-partisan|no\s*party|unaffiliated|indep\.?)\b|^i$/i;

/**
 * Normalizes a raw party string into a PartyClass. Returns null for empty /
 * unknown input so callers can decide the default (we treat unknown as
 * non-partisan for gating — the empowerment framing is the safer default for an
 * unlabeled independent-friendly platform).
 */
export function classifyParty(raw: string | null | undefined): PartyClass | null {
	if (!raw) return null;
	const value = raw.trim();
	if (!value) return null;
	if (REPUBLICAN_RE.test(value)) return 'republican';
	if (DEMOCRAT_RE.test(value)) return 'democrat';
	if (INDEPENDENT_RE.test(value)) return 'independent';
	return 'other';
}

/** Picks the most specific class across several raw party strings. */
export function classifyPartyFrom(
	...raws: Array<string | null | undefined>
): PartyClass | null {
	for (const raw of raws) {
		const cls = classifyParty(raw);
		if (cls) return cls;
	}
	return null;
}

/**
 * True when the person is a major-party (Republican or Democrat) affiliate.
 * Drives the partisan gating: these unclaimed pages render the bare civics
 * spine without GoodParty.org empowerment/pledge framing.
 */
export function isMajorParty(cls: PartyClass | null): boolean {
	return cls === 'republican' || cls === 'democrat';
}
