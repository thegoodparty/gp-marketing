import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { ElectionItem } from '~/ui/ElectionsIndexBlock';
import { US_STATES_TUPLES } from '~/constants/usStates';
import { COUNTY_MTFCC, getCityPlacesByCounty, getPlacesByState } from '~/lib/electionsApi';
import { transformButtons } from '~/lib/buttonTransformer';
import { DEFAULT_DISPLAY_COUNT } from '~/constants/display';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';
import { RichData } from '~/ui/RichData';

type ElectionsIndexBlockSectionProps = Extract<Sections, { _type: 'component_electionsIndexBlock' }> & {
	electionsOverride?: ElectionItem[];
	stateSlugOverride?: string;
};

function statesToElectionItems(): ElectionItem[] {
	return US_STATES_TUPLES.map(([code, name]) => ({
		name,
		href: `/elections/${code.toLowerCase()}`,
		level: 'state' as const,
	}));
}

export async function ElectionsIndexBlockSection(props: ElectionsIndexBlockSectionProps) {
	const { electionsOverride, stateSlugOverride, ...section } = props;
	const slug = (stateSlugOverride ?? '').trim().toLowerCase();

	const bgValue = section.electionsIndexBlockDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue
		? String(stegaClean(bgValue)).toLowerCase() === 'cream'
			? 'cream'
			: 'midnight'
		: 'midnight';

	let elections: ElectionItem[];

	if (electionsOverride && electionsOverride.length > 0) {
		elections = electionsOverride;
	} else if (!slug) {
		elections = statesToElectionItems();
	} else if (!slug.includes('/')) {
		const places = await getPlacesByState({ state: slug.toUpperCase(), mtfcc: COUNTY_MTFCC });
		if (places.length > 0) {
			elections = places.map(p => ({
				name: p.name,
				href: `/elections/${p.slug}`,
				level: 'county' as const,
			}));
		} else {
			elections = statesToElectionItems();
		}
	} else {
		const statePart = slug.split('/')[0] ?? '';
		const cityPlaces = await getCityPlacesByCounty({
			state: statePart.toUpperCase(),
			countySlug: slug,
		});
		if (cityPlaces.length > 0) {
			elections = cityPlaces.map(c => ({
				name: c.name,
				href: `/elections/${slug}/${c.slug.split('/').pop() ?? c.name.toLowerCase().replace(/\s+/g, '-')}`,
				level: 'city' as const,
			}));
		} else {
			elections = statesToElectionItems();
		}
	}

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section="Elections Index Block"
		>
			<ElectionsIndexBlock
				backgroundColor={backgroundColor}
				stateSlug={stateSlugOverride ?? ''}
				elections={elections}
				header={{
					title: section.electionsIndexBlockHeader?.field_title,
					label: section.electionsIndexBlockHeader?.field_label,
					copy: <RichData value={section.electionsIndexBlockHeader?.block_summaryText} />,
					backgroundColor,
					buttons: transformButtons(section.electionsIndexBlockHeader?.list_buttons),
				}}
				showSearch={section.electionsIndexBlockDesignSettings?.field_showSearch ?? true}
				searchPlaceholder={
					section.electionsIndexBlockDesignSettings?.field_searchPlaceholder ??
					'Search by county or city'
				}
				initialDisplayCount={section.electionsIndexBlockDesignSettings?.field_initialDisplayCount ?? DEFAULT_DISPLAY_COUNT}
				ctaLabel={section.electionsIndexBlockDesignSettings?.field_ctaLabel ?? 'Browse CTA'}
			/>
		</section>
	);
}
