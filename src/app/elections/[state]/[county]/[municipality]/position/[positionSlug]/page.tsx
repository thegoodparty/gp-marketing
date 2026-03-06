import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	getPlacesByState,
	getPlacesBySlugWithChildren,
	getRaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
} from '~/lib/electionsHelpers';
import { PositionPageContent } from '~/ui/PositionPageContent';

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string; municipality: string; positionSlug: string }>;
}) {
	const { state, county, municipality, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(state, positionSlug, county, municipality);
	let race = await getRaceBySlug(raceSlug);

	if (!race && !county.endsWith('-county')) {
		const retrySlug = buildRaceSlug(state, positionSlug, `${county}-county`, municipality);
		const retryRace = await getRaceBySlug(retrySlug);
		if (retryRace) {
			redirect(
				`/elections/${state.toLowerCase()}/${county}-county/${municipality.toLowerCase()}/position/${positionSlug}`,
			);
		}
	}

	if (!race) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;

	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);

	if (!municipalityPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const cityName = municipalityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${fullSlug}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: `${countyName} County` },
		{ href: `/elections/${fullSlug}`, label: cityName },
		{ href: '', label: officeName },
	];

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={`${countyName} County`}
			cityName={cityName}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			backHref={`/elections/${fullSlug}`}
			backLabel={`Back to ${cityName} elections`}
			candidatesHref={candidatesHref}
			race={race}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		municipality: string;
		positionSlug: string;
	}>;
}): Promise<Metadata> {
	const { state, county, municipality, positionSlug } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const raceSlug = buildRaceSlug(state, positionSlug, county, municipality);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);
	const cityName = municipalityPlace?.name ?? municipality;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${cityName}, ${countyName} County, ${stateName}.`,
	};
}
