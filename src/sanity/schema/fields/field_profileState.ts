/**
 * The 12 approved person-profile page states (A–L), mirroring the render model in
 * `~/lib/peopleProfile.ts` (`ProfileState` + `resolveProfileState`). Two axes layer
 * over the 4 personas (candidate / officeholder / both / past):
 *  - claimed (A–C, G): owner-authored, empowered, pledge-gated
 *  - unclaimed non-partisan (D–F, H): programmatic SEO w/ empowerment + claim CTA
 *  - unclaimed major-party (I/J): bare civics spine, no empowerment/pledge/claim
 *  - removal requested (K/L): minimal civics spine, photo/authored content stripped
 *
 * A person-profile Custom Template may pin itself to a single state so editors can
 * author per-state marketing overrides. Leaving it unset makes the template apply
 * to every state (matched by target slug only).
 */
export const PROFILE_STATES = [
	{ title: 'A — Claimed · Candidate', value: 'A' },
	{ title: 'B — Claimed · Officeholder', value: 'B' },
	{ title: 'C — Claimed · Both (serving + running)', value: 'C' },
	{ title: 'D — Unclaimed · Candidate (non-partisan)', value: 'D' },
	{ title: 'E — Unclaimed · Officeholder (non-partisan)', value: 'E' },
	{ title: 'F — Unclaimed · Both (non-partisan)', value: 'F' },
	{ title: 'G — Claimed · Past officeholder', value: 'G' },
	{ title: 'H — Unclaimed · Past officeholder (non-partisan)', value: 'H' },
	{ title: 'I — Unclaimed · Major-party candidate', value: 'I' },
	{ title: 'J — Unclaimed · Major-party officeholder/past', value: 'J' },
	{ title: 'K — Removal requested · Candidate variant', value: 'K' },
	{ title: 'L — Removal requested · Officeholder/past variant', value: 'L' },
] as const;

export type ProfileStateValue = (typeof PROFILE_STATES)[number]['value'];

export const field_profileState = {
	name: 'field_profileState',
	title: 'Person Profile State (A–L)',
	type: 'string',
	description:
		'Optional. Pin this person-profile template to a single Figma page state (A–L). Leave unset to apply to all states matched by the target slug.',
	options: {
		list: [...PROFILE_STATES],
	},
};
