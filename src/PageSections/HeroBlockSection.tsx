import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { HeroBlock } from '~/ui/HeroBlock';

import { RichData } from '~/ui/RichData';

import { resolveHeroLayout } from '~/ui/_lib/resolveHeroLayout';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

export function HeroBlockSection(section: Extract<Sections, { _type: 'component_hero' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Hero Block'>
			<HeroBlock
				label={section.summaryInfo?.field_label}
				title={section.summaryInfo?.field_title ?? ''}
				copy={<RichData value={section.summaryInfo?.block_summaryText} />}
				buttons={transformButtons(section.summaryInfo?.list_buttons)}
				image={section.heroImage?.img_image}
				priority={!!section.heroImage?.img_image && !section.heroImage?.field_displayEmbed}
				showFullImage={section.heroImage?.showFullImage}
				embedCode={section.heroImage?.field_displayEmbed ? section.heroImage?.field_embedCode : undefined}
				layout={resolveHeroLayout({
					imagePosition: stegaClean(section.heroDesignSettings?.field_imagePosition),
					imageSize: stegaClean(section.heroDesignSettings?.field_heroImageSize),
					hasEmbed: !!section.heroImage?.field_displayEmbed && !!section.heroImage?.field_embedCode,
				})}
				backgroundColor={
					section.heroDesignSettings?.field_blockColorCreamMidnight &&
					resolveBg(stegaClean(section.heroDesignSettings.field_blockColorCreamMidnight))
				}
				textSize={resolveTextSize(section.summaryInfo?.field_textSize)}
			/>
		</section>
	);
}
