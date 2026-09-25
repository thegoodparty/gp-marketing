import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { resolveAvatars } from '~/ui/_lib/resolveAvatars';
import { ElectionsNearYouBlock } from '~/ui/ElectionsNearYouBlock';

export function ElectionsNearYouBlockSection(section: Extract<Sections, { _type: 'component_electionsNearYouBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Near You Block'>
			<ElectionsNearYouBlock
				heading={section.field_heading ?? ''}
				body={section.field_body ?? ''}
				buttonLabel={section.field_buttonLabel ?? 'Search'}
				backgroundColor={section.field_backgroundVariant ? stegaClean(section.field_backgroundVariant) : undefined}
				layout={section.field_layoutVariant ? stegaClean(section.field_layoutVariant) : undefined}
				showSocialProof={section.field_showSocialProof ?? false}
				socialProofText={section.field_socialProofText ?? undefined}
				socialProofAvatars={resolveAvatars(section.list_Choose3People)}
			/>
		</section>
	);
}
