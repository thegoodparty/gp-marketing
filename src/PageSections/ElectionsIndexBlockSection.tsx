import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { ElectionItem } from '~/ui/ElectionsIndexBlock';
import { US_STATES_TUPLES } from '~/constants/usStates';
import { COUNTY_MTFCC, getCityPlacesByCounty, getPlacesByState } from '~/lib/electionsApi';
import { transformButtons } from '~/lib/buttonTransformer';
import { DEFAULT_DISPLAY_COUNT } from '~/constants/display';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';
import { RichData } from '~/ui/RichData';

type ElectionsIndexBlockSectionProps = Extract<Sections, { _type: 'component_electionsIndexBlock' }> & {
	electionsOverride?: ElectionItem[];
	stateSlugOverride?: string;
	indexOverride?: {
		hidden?: boolean;
		header?: { title?: string; copy?: string; searchPlaceholder?: string };
	};
	tokens?: TokenMap;
};

function statesToElectionItems(): ElectionItem[] {
	return US_STATES_TUPLES.map(([code, name]) => ({
		name,
		href: `/elections/${code.toLowerCase()}`,
		level: 'state' as const,
	}));
}

/**
 * Renders the resolved elections list. Kept synchronous (no data fetching) so
 * callers that already have the elections (person profiles, and the states
 * fallback) render without an async boundary — that lets the block be rendered
 * client-side (e.g. Storybook) without React's "async Client Component" error.
 */
function ElectionsIndexView({
	elections,
	section,
	stateSlugOverride,
	indexOverride,
	tokens,
}: {
	elections: ElectionItem[];
	section: Extract<Sections, { _type: 'component_electionsIndexBlock' }>;
	stateSlugOverride?: string;
	indexOverride?: ElectionsIndexBlockSectionProps['indexOverride'];
	tokens?: TokenMap;
}) {
	const bgValue = section.electionsIndexBlockDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue
		? String(stegaClean(bgValue)).toLowerCase() === 'cream'
			? 'cream'
			: 'midnight'
		: 'midnight';

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
					title: resolveSectionText(indexOverride?.header?.title ?? section.electionsIndexBlockHeader?.field_title, tokens),
					label: resolveSectionText(section.electionsIndexBlockHeader?.field_label, tokens),
					copy: indexOverride?.header?.copy ? (
						indexOverride.header.copy
					) : (
						<RichData
							value={resolveRichTextTokens(
								section.electionsIndexBlockHeader?.block_summaryText,
								tokens,
							)}
						/>
					),
					backgroundColor,
					buttons: transformButtons(section.electionsIndexBlockHeader?.list_buttons),
				}}
				showSearch={section.electionsIndexBlockDesignSettings?.field_showSearch ?? true}
				searchPlaceholder={
					indexOverride?.header?.searchPlaceholder ??
					section.electionsIndexBlockDesignSettings?.field_searchPlaceholder ??
					'Search by county or city'
				}
				initialDisplayCount={section.electionsIndexBlockDesignSettings?.field_initialDisplayCount ?? DEFAULT_DISPLAY_COUNT}
				ctaLabel={section.electionsIndexBlockDesignSettings?.field_ctaLabel ?? 'Browse CTA'}
			/>
		</section>
	);
}

/** Location-index branch: fetches the county/city list for a place slug (server-only). */
async function ElectionsIndexBlockSectionAsync(props: ElectionsIndexBlockSectionProps) {
	const { stateSlugOverride, indexOverride, tokens, ...section } = props;
	const slug = (stateSlugOverride ?? '').trim().toLowerCase();

	let elections: ElectionItem[];
	if (!slug.includes('/')) {
		const places = await getPlacesByState({ state: slug.toUpperCase(), mtfcc: COUNTY_MTFCC });
		elections = places.length > 0
			? places.map(p => ({ name: p.name, href: `/elections/${p.slug}`, level: 'county' as const }))
			: statesToElectionItems();
	} else {
		const statePart = slug.split('/')[0] ?? '';
		const cityPlaces = await getCityPlacesByCounty({ state: statePart.toUpperCase(), countySlug: slug });
		elections = cityPlaces.length > 0
			? cityPlaces.map(c => ({
					name: c.name,
					href: `/elections/${slug}/${c.slug.split('/').pop() ?? c.name.toLowerCase().replace(/\s+/g, '-')}`,
					level: 'city' as const,
				}))
			: statesToElectionItems();
	}

	return (
		<ElectionsIndexView
			elections={elections}
			section={section as Extract<Sections, { _type: 'component_electionsIndexBlock' }>}
			stateSlugOverride={stateSlugOverride}
			indexOverride={indexOverride}
			tokens={tokens}
		/>
	);
}

export function ElectionsIndexBlockSection(props: ElectionsIndexBlockSectionProps) {
	const { electionsOverride, stateSlugOverride, indexOverride, ...section } = props;

	if (indexOverride?.hidden) {
		return null;
	}

	const slug = (stateSlugOverride ?? '').trim().toLowerCase();
	const hasOverride = !!electionsOverride && electionsOverride.length > 0;

	// Sync path: elections already provided (person profiles) or no slug to fetch
	// (states fallback). Only the location-index branch needs an async fetch.
	if (hasOverride || !slug) {
		return (
			<ElectionsIndexView
				elections={hasOverride ? electionsOverride : statesToElectionItems()}
				section={section as Extract<Sections, { _type: 'component_electionsIndexBlock' }>}
				stateSlugOverride={stateSlugOverride}
				indexOverride={indexOverride}
				tokens={props.tokens}
			/>
		);
	}

	return <ElectionsIndexBlockSectionAsync {...props} />;
}
