import { stegaClean } from 'next-sanity';
import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { resolveColumns } from '~/PageSections/IconContentBlockSection';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { ImageContentBlock } from '~/ui/ImageContentBlock';
import { RichData } from '~/ui/RichData';

export function ImageContentBlockSection(section: Extract<Sections, { _type: 'component_imageContentBlock' }>) {
	const backgroundColor = section.imageContentBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(section.imageContentBlockDesignSettings.field_blockColorCreamMidnight)
		: 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Image Content Block'>
			<ImageContentBlock
				backgroundColor={backgroundColor}
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					caption: section.summaryInfo?.field_caption,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
				}}
				columns={resolveColumns(stegaClean(section.imageContentBlockDesignSettings?.field_columnLayout234Columns))}
				items={section.imageContentBlockItems?.list_imageContentItems?.map(item => ({
					image: item.img_image,
					showFullImage: item.showFullImage,
					title: item.field_title,
					subtitle: item.field_subTitle,
					copy: <RichData value={item.block_summaryText} />,
				}))}
			/>
		</section>
	);
}
