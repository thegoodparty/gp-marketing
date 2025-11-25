import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { tv } from '~/ui/_lib/utils';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { RichData } from '~/ui/RichData';
import { stegaClean } from 'next-sanity';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-12 md:gap-20 py-[calc(var(--container-padding))]',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export async function CTAImageBlockSection(section: Extract<Sections, { _type: 'component_ctaImageBlock' }>) {
	const backgroundColor = section.designSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.designSettings.field_blockColorCreamMidnight))
		: 'cream';

	const componentColor = section.designSettings?.field_componentColor6ColorsInverse
		? resolveComponentColor(stegaClean(section.designSettings.field_componentColor6ColorsInverse))
		: 'red';

	const { base } = styles({ backgroundColor });

	return (
		<section className={base()} data-section='CTA Image Block'>
			<CTAImageBlock
				color={componentColor}
				image={section.image?.img_featuredImage}
				showFullImage={section.image?.showFullImage}
				label={section['overview']?.field_label}
				title={section['overview']?.field_title}
				copy={<RichData value={section['overview']?.block_summaryText} />}
				caption={section['overview']?.field_caption}
				primaryButton={transformButtons([section['primaryCTA']])?.[0]}
				secondaryButton={transformButtons([section['primaryCTA'], section['secondaryCTA']])?.[0]}
			/>
		</section>
	);
}
