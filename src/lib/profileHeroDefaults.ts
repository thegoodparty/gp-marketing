/**
 * The Profile Hero's intro paragraph, as the Voter Guide frames word it
 * (Figma 2139:26364 / 2139:26634). One preset per subject, because the
 * candidate wording ("candidacy") reads wrong on an officeholder's page; the
 * swap to "public service" is marketing's (Emily, 2026-10-06).
 *
 * Shared by the Studio `initialValue` and the section's fallback, so a Person
 * Profile template saved before the field existed renders the same words a
 * freshly added block does. `[candidate name]` is filled by the page tokens.
 */
export const PROFILE_HERO_INTRO_DEFAULTS = {
	candidate:
		'Learn about [candidate name]’s candidacy and positions on the issues. This guide is built by GoodParty.org, a nonpartisan organization helping you find candidates and elected officials who have turned down partisan and big-money influence.',
	officeholder:
		'Learn about [candidate name]’s public service and positions on the issues. This guide is built by GoodParty.org, a nonpartisan organization helping you find candidates and elected officials who have turned down partisan and big-money influence.',
} as const;
