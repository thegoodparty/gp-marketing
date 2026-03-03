import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { RichData } from '~/ui/RichData';
import { TabbedImageBlock } from '~/ui/TabbedImageBlock';

export function TabbedImageBlockSection(section: Extract<Sections, { _type: 'component_tabbedImageBlock' }>) {
	const backgroundColor = section.tabbedImageBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.tabbedImageBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	const items = section.tabbedImageBlockItems?.list_tabbedImageItems
		?.map(item =>
			item.field_title
				? {
						_key: item._key,
						title: item.field_title,
						copy: item.field_summaryDescription,
						image: item.img_image,
						showFullImage: item.showFullImage,
						button: item.ctaActionWithShared?.action
							? transformButtons([{ ...item.ctaActionWithShared, _key: item._key + 'TabbedImageBlockButton' }])?.[0]
							: undefined,
					}
				: undefined,
		)
		.filter(Boolean);

	if (!(items && items.length > 0)) return null;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Tabbed Image Block'>
			<TabbedImageBlock
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					layout: 'left',
					backgroundColor,
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				items={items}
			/>
		</section>
	);
}
