import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlacesByState, getPlacesBySlugWithChildren } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { getStateName } from '~/lib/electionsHelpers';
import { Container } from '~/ui/Container';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string; municipality: string }>;
}) {
	const { state, county, municipality } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
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
	const municipalityPlace = children.find(
		c => c.slug.toLowerCase() === fullSlug,
	);

	if (!municipalityPlace) {
		notFound();
	}

	const cityName = municipalityPlace.name;

	return (
		<>
			<LocationLandingPageHero
				locationLevel="city"
				stateName={stateName}
				countyName={countyName}
				cityName={cityName}
			/>
			<Container size="xl" className="py-(--container-padding)">
				<p className="mb-6 font-secondary text-body-2 text-neutral-600">
					<Link
						href={`/elections/${countySlug}`}
						className="text-goodparty-blue hover:underline"
					>
						Back to {countyName} County
					</Link>
				</p>
				<p className="font-secondary text-body-2 text-neutral-600">
					Elections in {cityName}, {stateName}. Local positions (mayor, city council, etc.) will be listed here when the API is available.
				</p>
			</Container>
		</>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; county: string; municipality: string }>;
}): Promise<Metadata> {
	const { state, county, municipality } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
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
	return {
		title: `Elections in ${cityName}, ${stateName} | Good Party`,
		description: `Browse elections and local positions in ${cityName}, ${countyName} County, ${stateName}.`,
	};
}
