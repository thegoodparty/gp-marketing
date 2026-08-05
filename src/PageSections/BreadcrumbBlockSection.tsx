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
				// Figma breadcrumb strip is a compact 68px band between the 80px nav
				// and the hero (24px above/below the line). The shared block defaults
				// to py-(--container-padding) (~80px), which stacks a big dark gap
				// above the hero — collapse it to the Figma rhythm here.
				className='py-4 md:py-6'
			/>
		</section>
	);
}
