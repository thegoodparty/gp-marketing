import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';

import { resolveAvatars } from '~/ui/_lib/resolveAvatars';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { BannerBlock } from '~/ui/BannerBlock';

export function BannerBlockSection(section: Extract<Sections, { _type: 'component_bannerBlock' }>) {
	const backgroundColor = section.bannerBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.bannerBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Banner Block'>
			<BannerBlock
				avatars={resolveAvatars(section.bannerBlockContent?.list_Choose3People)}
				backgroundColor={backgroundColor}
				color={resolveComponentColor(stegaClean(section.bannerBlockDesignSettings?.field_componentColor6ColorsInverse), backgroundColor)}
				copy={section.bannerBlockContent?.field_bannerText}
			/>
		</section>
	);
}
