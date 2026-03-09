export interface RaceNode {
	id: string;
	isPrimary: boolean;
	filingPeriods: Array<{ startOn: string; endOn: string }>;
	election: {
		id: string;
		electionDay: string;
		name: string;
		state: string;
		timezone: string;
		primaryElectionDate?: string;
	};
	position: {
		id: string;
		name: string;
		level: string;
		partisanType: string;
		state: string;
		subAreaName?: string;
		subAreaValue?: string;
		electionFrequencies: Array<{ frequency: number[] }>;
	};
}

export interface DistrictTypeItem {
	id: string;
	L2DistrictType: string;
}

export interface DistrictNameItem {
	id: string;
	L2DistrictName: string;
}

export interface CandidacyItem {
	id: string;
	slug?: string;
	firstName?: string;
	lastName?: string;
	image?: string;
	party?: string;
	raceId?: string;
	positionId?: string;
	positionName?: string;
	state?: string;
	placeName?: string;
	about?: string;
	email?: string;
	urls?: string[];
	Stances?: Array<{
		Issue?: { name?: string };
		stanceStatement?: string;
	}>;
	Race?: {
		brHashId: string;
		electionDate?: string;
		[key: string]: unknown;
	};
}

export interface RaceDetail {
	id: number | string;
	slug: string;
	name: string;
	state: string;
	normalizedPositionName?: string;
	positionDescription?: string;
	positionLevel?: string;
	positionNames?: string[];
	electionDate?: string;
	frequency?: string[];
	filingDateStart?: string;
	filingDateEnd?: string;
	employmentType?: string;
	salary?: string;
	eligibilityRequirements?: string;
	filingOfficeAddress?: string;
	filingPhoneNumber?: string;
	paperworkInstructions?: string;
	filingRequirements?: string;
	isRunoff?: boolean;
	isPrimary?: boolean;
	partisanType?: string;
	Place?: PlaceWithFacts & {
		parent?: { name: string; slug: string; state: string; geoId?: string };
	};
}

export interface PositionDetail {
	id: string;
	name?: string;
	position?: {
		id: string;
		name: string;
		level?: string;
		state?: string;
	};
	election?: {
		electionDay?: string;
		name?: string;
	};
	filingPeriods?: Array<{ startOn: string; endOn: string }>;
}

export interface FindByRaceIdResponse {
	id: number;
	slug: string;
	statusCode?: number;
	details: {
		occupation?: string;
		funFact?: string;
		party?: string;
		pastExperience?: string;
		website?: string;
		runningAgainst?: Array<{ name: string; party: string; description: string }>;
		customIssues?: Array<{ title: string; description: string }>;
	} | null;
	updatedAt: string;
	website: {
		id: number;
		vanityPath: string;
		status: string;
		content: Record<string, unknown> | null;
		domain: { name: string; status: string } | null;
	} | null;
	campaignPositions: Array<{
		description: string | null;
		position: { name: string };
		topIssue: { name: string } | null;
	}>;
}

export interface FeaturedCity {
	name: string;
	slug: string;
	race_count: number;
}

export interface PlaceRace {
	id: number | string;
	slug: string;
	normalizedPositionName?: string;
	name?: string;
	positionLevel?: string;
	positionDescription?: string;
	electionDate?: string;
}

export interface PlaceItem {
	id: string;
	name: string;
	slug: string;
	state: string;
	mtfcc?: string;
	children?: PlaceItem[];
	/** County name from API (e.g. "Los Angeles"); used for filtering cities by county. */
	countyName?: string;
}

export interface PlaceWithFacts extends PlaceItem {
	cityLargest?: string;
	population?: number;
	density?: number;
	incomeHouseholdMedian?: number;
	unemploymentRate?: number;
	homeValue?: number;
	Races?: PlaceRace[];
}
