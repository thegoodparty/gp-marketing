import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';

import { ImageTwoColumnCopyBlock } from '~/ui/ImageTwoColumnCopyBlock';
import { RichData } from '~/ui/RichData';

function resolveMediaAlignment(value?: string | null): 'left' | 'right' {
	return stegaClean(value) === 'Right' ? 'right' : 'left';
}

export function ImageTwoColumnCopyBlockSection(
	// @ts-expect-error — run `bun run sanity:generate` to add component_imageTwoColumnCopyBlock to the Sections union
	section: Extract<Sections, { _type: 'component_imageTwoColumnCopyBlock' }>,
) {
	const backgroundColor = section.imageTwoColumnCopyBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.imageTwoColumnCopyBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const mediaAlignment = resolveMediaAlignment(section.imageTwoColumnCopyBlockDesignSettings?.field_mediaAlignmentRightLeft);

	const button = transformButtons([section.primaryCTA])?.[0];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Image Two Column Copy Block'>
			<ImageTwoColumnCopyBlock
				backgroundColor={backgroundColor}
				mediaAlignment={mediaAlignment}
				image={section.ctaAssets?.img_featuredImage}
				showFullImage={section.ctaAssets?.showFullImage}
				label={section.field_label}
				title={section.field_title}
				copy1={<RichData value={section.block_copyLeft} />}
				copy2={<RichData value={section.block_copyRight} />}
				primaryButton={button}
			/>
		</section>
	);
}
