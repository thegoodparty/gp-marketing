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
	firstName?: string;
	lastName?: string;
	party?: string;
	raceId?: string;
	positionId?: string;
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
	details: Record<string, unknown> | null;
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

export interface PlaceItem {
	id: string;
	name: string;
	slug: string;
	state: string;
	mtfcc?: string;
	children?: PlaceItem[];
}

export interface PlaceWithFacts extends PlaceItem {
	cityLargest?: string;
	population?: number;
	density?: number;
	incomeHouseholdMedian?: number;
	unemploymentRate?: number;
	homeValue?: number;
}
