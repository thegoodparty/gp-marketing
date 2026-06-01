import { stegaClean } from 'next-sanity';
import type { SectionOverrides, Sections } from '~/PageSections';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';

type Props = Extract<Sections, { _type: 'component_breadcrumbBlock' }> & {
	breadcrumbOverride?: SectionOverrides['component_breadcrumbBlock'];
};

export function BreadcrumbBlockSection({ breadcrumbOverride, ...section }: Props) {
	const backgroundColor = section.breadcrumbBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.breadcrumbBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const breadcrumbs = breadcrumbOverride?.breadcrumbs ?? [];

	if (breadcrumbs.length === 0) {
		return null;
	}

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Breadcrumb Block'>
			<BreadcrumbBlock
				backgroundColor={backgroundColor}
				breadcrumbs={breadcrumbs}
				className='pb-4 md:pb-6'
			/>
		</section>
	);
}
