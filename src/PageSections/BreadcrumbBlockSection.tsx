import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';

export function BreadcrumbBlockSection(section: Extract<Sections, { _type: 'component_breadcrumbBlock' }>) {
	const backgroundColor = section.breadcrumbBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.breadcrumbBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	// TODO: Generate breadcrumbs from page context/hierarchy
	// For now, this returns an empty array. When integrated into Position Pages,
	// the breadcrumbs should be generated from the location hierarchy
	// (state > county > city > office)
	const breadcrumbs = [];

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Breadcrumb Block'>
			<BreadcrumbBlock backgroundColor={backgroundColor} breadcrumbs={breadcrumbs} />
		</section>
	);
}
