import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { DemoRequestBlock } from '~/ui/DemoRequestBlock';

export function DemoRequestBlockSection(section: Extract<Sections, { _type: 'component_demoRequestBlock' }>) {
	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Demo Request Block'>
			<DemoRequestBlock
				heading={section.field_heading ?? ''}
				body={section.field_body ?? ''}
				talkingPoints={(section.field_talkingPoints ?? []).map(point => ({
					title: point.field_title ?? '',
					copy: point.field_copy ?? '',
				}))}
				apiEndpoint={section.field_apiEndpoint ? stegaClean(section.field_apiEndpoint) : undefined}
				backgroundColor={section.field_backgroundVariant ? stegaClean(section.field_backgroundVariant) : undefined}
			/>
		</section>
	);
}
