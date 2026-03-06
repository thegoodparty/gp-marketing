import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlacesByState, getPlacesBySlugWithChildren } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { DEFAULT_DISPLAY_COUNT } from '~/constants/display';
import { Container } from '~/ui/Container';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string }>;
}) {
	const { state, county } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(
		c => c.slug.toLowerCase() === fullSlug,
	);

	if (!countyPlace) {
		notFound();
	}

	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;

	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: fullSlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];

	const municipalities = children.map(c => ({
		name: c.name,
		href: `/elections/${c.slug}`,
		level: 'city' as const,
	}));

	return (
		<>
			<LocationLandingPageHero
				locationLevel="county"
				stateName={stateName}
				countyName={countyName}
			/>
			<Container size="xl" className="py-(--container-padding)">
				<p className="mb-6 font-secondary text-body-2 text-neutral-600">
					<Link
						href={`/elections/${state.toLowerCase()}`}
						className="text-goodparty-blue hover:underline"
					>
						Back to {stateName} elections
					</Link>
				</p>
			</Container>
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={fullSlug}
				elections={municipalities}
				header={{
					title: `Municipalities in ${countyName} County`,
					copy: `Browse elections by municipality in ${countyName} County, ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder="Search by municipality"
				ctaLabel="Browse CTA"
			/>
		</>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; county: string }>;
}): Promise<Metadata> {
	const { state, county } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const countyName = countyPlace?.name ?? county;
	return {
		title: `Elections in ${countyName}, ${stateName} | Good Party`,
		description: `Browse elections and municipalities in ${countyName}, ${stateName}.`,
	};
}
