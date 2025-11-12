import type { ArticleSections } from '~/RichTextContentSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';

import { CTABlock } from '~/ui/CTABlock';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

export function CTASectionGroup(section: Extract<ArticleSections, { _type: 'ctaSection' }>) {
	return (
		<section data-group='CTASectionGroup'>
			<CTABlock
				id={section._key}
				label={section['overview']?.field_label}
				title={section['overview']?.field_title}
				copy={<RichData value={section['overview']?.block_summaryText} />}
				caption={section['overview']?.field_caption}
				buttons={transformButtons([section['primaryCTA'], { ...section['secondaryCTA'], hierarchy: 'Secondary' }])}
				color={resolveComponentColor(stegaClean(section.field_componentColor6Colors ?? undefined))}
				layout='blog'
			/>
		</section>
	);
}
