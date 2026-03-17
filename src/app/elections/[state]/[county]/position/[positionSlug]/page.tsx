import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { COUNTY_MTFCC, getPlacesByState, getRaceBySlug } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
	stripCountySuffix,
} from '~/lib/electionsHelpers';
import { toAbsoluteUrl } from '~/lib/url';
import { PositionPageContent } from '~/ui/PositionPageContent';

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string; positionSlug: string }>;
}) {
	const { state, county, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(state, positionSlug, county);
	const race = await getRaceBySlug(raceSlug);

	if (!race && !county.endsWith('-county')) {
		const retrySlug = buildRaceSlug(state, positionSlug, `${county}-county`);
		const retryRace = await getRaceBySlug(retrySlug);
		if (retryRace) {
			redirect(`/elections/${state.toLowerCase()}/${county}-county/position/${positionSlug}`);
		}
	}

	if (!race) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace ? stripCountySuffix(countyPlace.name) : county;

	const stateName = getStateName(stateCode);
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${countySlug}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace?.name ?? `${countyName} County` },
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${countySlug}/position/${positionSlug}`);

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={countyPlace?.name ?? `${countyName} County`}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			candidatesHref={candidatesHref}
			race={race}
			pageUrl={pageUrl}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; county: string; positionSlug: string }>;
}): Promise<Metadata> {
	const { state, county, positionSlug } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const raceSlug = buildRaceSlug(state, positionSlug, county);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace ? stripCountySuffix(countyPlace.name) : county;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	const countyDisplayName = countyPlace?.name ?? `${countyName} County`;
	return {
		title: `${positionName} in ${countyDisplayName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${countyDisplayName}, ${stateName}.`,
	};
}
