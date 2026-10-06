import { stegaClean } from 'next-sanity';

import { resolveSectionText } from '~/lib/resolveSectionText';
import type { TokenMap } from '~/lib/resolveTokens';
import type { SectionOverrides, Sections } from '~/PageSections';
import { NearbyOffices } from '~/ui/NearbyOffices';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Props = Extract<Sections, { _type: 'component_nearbyOffices' }> & {
	nearbyOverride?: SectionOverrides['component_nearbyOffices'];
	tokens?: TokenMap;
};

/**
 * Data-backed: the rows come from the position page route, not from Sanity.
 * Only the position pages populate the override today, so anywhere else the
 * block renders nothing.
 */
export function NearbyOfficesSection(props: Props) {
	const { nearbyOverride, tokens, ...section } = props;
	const offices = nearbyOverride?.offices ?? [];
	if (offices.length === 0) return null;
	const bgValue = section.nearbyOfficesDesignSettings?.field_blockColorCreamMidnight;
	const backgroundColor = bgValue ? resolveBg(stegaClean(bgValue)) : 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Nearby Offices'>
			<NearbyOffices
				backgroundColor={backgroundColor}
				heading={resolveSectionText(section.field_heading, tokens)}
				offices={offices}
			/>
		</section>
	);
}
