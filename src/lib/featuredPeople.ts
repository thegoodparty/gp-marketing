/**
 * The featured people carousel's data shape and ordering rule, kept apart from
 * the election-api fetching in `featuredCandidates.ts` so the section wrapper
 * (and anything rendering the block) does not import the API client.
 */
/** Marketing's cap for the carousel (Emily, 2026-09-29), applied in the section as well. */
export const FEATURED_PEOPLE_LIMIT = 8;

export type FeaturedPersonRole = 'candidate' | 'representative';

export type FeaturedPersonCard = {
	personId: string | null;
	name: string;
	/** The office the person is running for, or currently holds. */
	office: string | null;
	/** "Houston, TX"; null hides the line. */
	location: string | null;
	href: string;
	avatarUrl: string | null;
	/** `pledgedFromSpine`: the same rule the person's own profile applies to its cards. */
	isPledged: boolean;
	/** No major party on the row. An unknown party counts as nonpartisan, as `classifyParty` documents. */
	isNonpartisan: boolean;
	role: FeaturedPersonRole;
	/** ISO date of the candidate's election; representatives have none. */
	electionDate: string | null;
};

export type FeaturedPeopleMode = 'both' | 'candidates' | 'representatives';

export type FeaturedPeople = {
	candidates: FeaturedPersonCard[];
	representatives: FeaturedPersonCard[];
};

export type FeaturedLocationLevel = 'state' | 'county' | 'city' | 'district';

/**
 * Pledged people lead, then unpledged people with no major party, then everyone
 * else (Emily, 2026-09-29). Inside each group candidates come first by soonest
 * election, then representatives by name. A person who is both a candidate and
 * an officeholder appears once, as whichever role was listed first.
 */
export function rankFeaturedPeople(people: FeaturedPersonCard[], options: { limit?: number } = {}): FeaturedPersonCard[] {
	const limit = options.limit ?? FEATURED_PEOPLE_LIMIT;
	const seen = new Set<string>();
	const unique = people.filter(person => {
		const key = (person.personId ?? person.href).toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	const tierOf = (person: FeaturedPersonCard) => (person.isPledged ? 0 : person.isNonpartisan ? 1 : 2);

	return unique
		.sort((a, b) => {
			const tier = tierOf(a) - tierOf(b);
			if (tier !== 0) return tier;
			if (a.role !== b.role) return a.role === 'candidate' ? -1 : 1;
			if (a.role === 'candidate') {
				if (a.electionDate !== b.electionDate) {
					if (!a.electionDate) return 1;
					if (!b.electionDate) return -1;
					return a.electionDate.localeCompare(b.electionDate);
				}
			}
			return a.name.localeCompare(b.name);
		})
		.slice(0, limit);
}

/** The people the Studio dropdown asks for, ranked and capped. */
export function selectFeaturedPeople(people: FeaturedPeople, mode: FeaturedPeopleMode, limit = FEATURED_PEOPLE_LIMIT): FeaturedPersonCard[] {
	const pool =
		mode === 'candidates' ? people.candidates : mode === 'representatives' ? people.representatives : [...people.candidates, ...people.representatives];
	return rankFeaturedPeople(pool, { limit });
}
