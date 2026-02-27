import type { Sections } from '~/PageSections';
import { EmbeddedBlock } from '~/ui/EmbeddedBlock';

export function EmbeddedBlockSection(section: Extract<Sections, { _type: 'component_embeddedBlock' }>) {
	if (!section.field_embedCode) return null;

	return (
		<section data-section="Embedded Block">
			<EmbeddedBlock html={section.field_embedCode} />
		</section>
	);
}
