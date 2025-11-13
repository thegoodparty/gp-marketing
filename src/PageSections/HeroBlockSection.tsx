import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveHeroLayout } from '~/ui/_lib/resolveHeroLayout';
import { HeroBlock } from '~/ui/HeroBlock';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

export function HeroBlockSection(section: Extract<Sections, { _type: 'component_hero' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Hero Block'>
			<HeroBlock
				label={section.summaryInfo?.field_label}
				title={section.summaryInfo?.field_title ?? ''}
				copy={<RichData value={section.summaryInfo?.block_summaryText} />}
				buttons={transformButtons(section.summaryInfo?.list_buttons)}
				image={section.heroImage?.img_image}
				layout={resolveHeroLayout({
					imagePosition: stegaClean(section.heroDesignSettings?.field_imagePosition),
					imageSize: stegaClean(section.heroDesignSettings?.field_heroImageSize),
				})}
				backgroundColor={
					section.heroDesignSettings?.field_blockColorCreamMidnight &&
					resolveBg(stegaClean(section.heroDesignSettings.field_blockColorCreamMidnight))
				}
			/>
		</section>
	);
}
