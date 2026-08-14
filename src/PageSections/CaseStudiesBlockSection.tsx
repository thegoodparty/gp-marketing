import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { CaseStudiesBlock } from '~/ui/CaseStudiesBlock';
import { RichData } from '~/ui/RichData';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { stegaClean } from 'next-sanity';

export function CaseStudiesBlockSection(section: Extract<Sections, { _type: 'component_caseStudiesBlock' }>) {
	if (!section.items) return null;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Case Studies Block'>
			<CaseStudiesBlock
				header={{
					title: section.summaryInfo?.field_title,
					label: section.summaryInfo?.field_label,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons ?? []),
				}}
				items={section.items.map(resolveBlogCard).filter(Boolean)}
				showSeeMoreButton={Boolean(section.caseStudiesBlockContent?.field_showSeeMoreButton)}
				allItemsCount={section.itemsCount ?? undefined}
			/>
		</section>
	);
}
