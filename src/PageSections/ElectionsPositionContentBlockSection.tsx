import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { ElectionsPositionContentBlock } from '~/ui/ElectionsPositionContentBlock';
import type {
	ElectionsPositionContentBlockCardProps,
	ElectionsPositionContentBlockGridItem,
	ElectionsPositionContentBlockBottomItem,
} from '~/ui/ElectionsPositionContentBlock';

export type ElectionsPositionContentBlockOverride = {
	card?: ElectionsPositionContentBlockCardProps;
	topHeadline?: string;
	gridItems?: ElectionsPositionContentBlockGridItem[];
	bottomItems?: ElectionsPositionContentBlockBottomItem[];
};

type ElectionsPositionContentBlockSectionProps = Extract<
	Sections,
	{ _type: 'component_electionsPositionContentBlock' }
> & {
	contentOverride?: ElectionsPositionContentBlockOverride;
};

export function ElectionsPositionContentBlockSection(props: ElectionsPositionContentBlockSectionProps) {
	const { contentOverride, ...section } = props;
	const backgroundColor = section.electionsPositionContentBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionsPositionContentBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section="Elections Position Content Block"
		>
			<ElectionsPositionContentBlock
				backgroundColor={backgroundColor}
				card={contentOverride?.card}
				topHeadline={contentOverride?.topHeadline}
				gridItems={contentOverride?.gridItems}
				bottomItems={contentOverride?.bottomItems}
			/>
		</section>
	);
}
