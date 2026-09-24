import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { ElectionsNearYouBlock } from '~/ui/ElectionsNearYouBlock';

export function ElectionsNearYouBlockSection(section: Extract<Sections, { _type: 'component_electionsNearYouBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Near You Block'>
			<ElectionsNearYouBlock
				heading={section.field_heading ?? ''}
				body={section.field_body ?? ''}
				buttonLabel={section.field_buttonLabel ?? 'Search'}
				backgroundColor={section.field_backgroundVariant ? stegaClean(section.field_backgroundVariant) : undefined}
				showSocialProof={section.field_showSocialProof ?? false}
			/>
		</section>
	);
}
