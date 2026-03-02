import type { Sections } from '~/PageSections';
import type { EmbeddedBlockProps } from '~/ui/EmbeddedBlock';
import { EmbeddedBlock } from '~/ui/EmbeddedBlock';

export function EmbeddedBlockSection(section: Extract<Sections, { _type: 'component_embeddedBlock' }>) {
	if (!section.field_embedCode) return null;

	return (
		<section data-section="Embedded Block">
			<EmbeddedBlock
				html={section.field_embedCode}
				height={section.field_embedHeight}
				fullPage={section.field_embedFullPage}
				maxWidth={section.field_embedMaxWidth as EmbeddedBlockProps['maxWidth']}
			/>
		</section>
	);
}
