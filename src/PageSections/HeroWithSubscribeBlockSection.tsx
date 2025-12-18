import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveForm } from '~/ui/_lib/resolveForm';
import { resolveHeroLayout } from '~/ui/_lib/resolveHeroLayout';
import { HeroBlock } from '~/ui/HeroBlock';
import { RichData } from '~/ui/RichData';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

export function HeroWithSubscribeBlockSection(section: Extract<Sections, { _type: 'component_heroWithSubscribe' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Hero With Subscribe Block'>
			<HeroBlock
				label={section.summaryInfoNoButtons?.field_label}
				title={section.summaryInfoNoButtons?.field_title ?? ''}
				copy={<RichData value={section.summaryInfoNoButtons?.block_summaryText} />}
				image={section.heroImage?.img_image}
				showFullImage={section.heroImage?.showFullImage}
				layout={resolveHeroLayout({
					imagePosition: stegaClean(section.heroDesignSettings?.field_imagePosition),
					imageSize: stegaClean(section.heroDesignSettings?.field_heroImageSize),
				})}
				backgroundColor={
					section.heroDesignSettings?.field_blockColorCreamMidnight &&
					resolveBg(stegaClean(section.heroDesignSettings.field_blockColorCreamMidnight))
				}
				form={resolveForm(stegaClean(section.heroSubscribeForm?.ref_formUsed ?? undefined))}
				textSize={resolveTextSize(section.summaryInfoNoButtons?.field_textSize)}
			/>
		</section>
	);
}
