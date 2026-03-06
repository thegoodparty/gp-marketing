import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDistrictTypes, getDistrictNames, getPlacesByState } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { DEFAULT_DISPLAY_COUNT, DEFAULT_YEAR_OFFSET } from '~/constants/display';
import { Container } from '~/ui/Container';
import { ListOfOfficesBlock } from '~/ui/ListOfOfficesBlock';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';

function formatElectionDate(year: number): string {
	const date = new Date(year, 10, 5);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string }>;
}) {
	const { state } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const electionYear = new Date().getFullYear() + DEFAULT_YEAR_OFFSET;

	const [districtTypes, countyPlaces] = await Promise.all([
		getDistrictTypes({
			state: stateCode,
			electionYear,
		}),
		getPlacesByState({ state: stateCode, mtfcc: 'G4020' }),
	]);

	const counties = countyPlaces.map(p => ({
		name: p.name,
		href: `/elections/${p.slug}`,
		level: 'county' as const,
	}));

	if (districtTypes.length === 0) {
		return (
			<>
				<LocationLandingPageHero
					locationLevel="state"
					stateName={stateName}
				/>
				<Container size="xl" className="py-(--container-padding)">
					<p className="mb-8 font-secondary text-body-2 text-neutral-600">
						No district data available for {stateName} in {electionYear}.
					</p>
				</Container>
				<ElectionsIndexBlock
					backgroundColor="midnight"
					stateSlug={state.toLowerCase()}
					elections={counties}
					header={{
						title: `Counties in ${stateName}`,
						copy: `Browse elections by county in ${stateName}.`,
						backgroundColor: 'midnight',
					}}
					initialDisplayCount={DEFAULT_DISPLAY_COUNT}
					showSearch={true}
					searchPlaceholder="Search by county"
					ctaLabel="Browse CTA"
				/>
			</>
		);
	}

	const districtNamesByType = await Promise.all(
		districtTypes.map(async dt =>
			getDistrictNames({
				L2DistrictType: dt.L2DistrictType,
				state: stateCode,
				electionYear,
			}).then(names =>
				names.map(n => ({
					id: n.id,
					type: dt.L2DistrictType,
					position: n.L2DistrictName,
					nextElectionDate: formatElectionDate(electionYear),
					href: `/elections/${state}/position?positionId=${encodeURIComponent(n.id)}&name=${encodeURIComponent(n.L2DistrictName)}`,
				})),
			),
		),
	);

	const offices = districtNamesByType.flat();

	return (
		<>
			<LocationLandingPageHero
				locationLevel="state"
				stateName={stateName}
			/>
			<ListOfOfficesBlock
				heading={`Elections in ${stateName}`}
				headline={`${offices.length} positions up for election in ${electionYear}`}
				defaultYear={electionYear}
				availableYears={[
					electionYear - 2,
					electionYear - 1,
					electionYear,
					electionYear + 1,
				]}
				offices={offices}
			/>
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={state.toLowerCase()}
				elections={counties}
				header={{
					title: `Counties in ${stateName}`,
					copy: `Browse elections by county in ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder="Search by county"
				ctaLabel="Browse CTA"
			/>
		</>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string }>;
}): Promise<Metadata> {
	const { state } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	return {
		title: `Elections in ${stateName} | Good Party`,
		description: `Browse elections and positions in ${stateName}.`,
	};
}
