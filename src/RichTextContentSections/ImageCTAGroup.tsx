import { transformButtons } from '~/lib/buttonTransformer';

import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { RichData } from '~/ui/RichData';

import type { ArticleSections } from '~/RichTextContentSections';

import { stegaClean } from 'next-sanity';

export function ImageCTAGroup(section: Extract<ArticleSections, { _type: 'imageCta' }>) {
	const componentColor = section.field_componentColor6Colors
		? resolveComponentColor(stegaClean(section.field_componentColor6Colors))
		: 'red';

	return (
		<section data-group='ImageCTAGroup'>
			<CTAImageBlock
				layout='blog'
				mediaAlignment='right'
				color={componentColor}
				image={section.image?.img_featuredImage}
				showFullImage={section.image?.showFullImage}
				label={section['overview']?.field_label}
				title={section['overview'].field_title}
				copy={<RichData value={section['overview']?.block_summaryText} />}
				caption={section['overview'].field_caption}
				primaryButton={transformButtons([section['primaryCTA']])?.[0]}
				secondaryButton={transformButtons([section['secondaryCTA']])?.[0]}
			/>
		</section>
	);
}
