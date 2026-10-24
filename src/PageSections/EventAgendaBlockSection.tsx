import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { transformButtons } from '~/lib/buttonTransformer';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveIconColor } from '~/ui/_lib/resolveComponentColor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { EventAgendaBlock } from '~/ui/EventAgendaBlock';
import { RichData } from '~/ui/RichData';

export function EventAgendaBlockSection(section: Extract<Sections, { _type: 'component_eventAgendaBlock' }>) {
	const backgroundColor = section.field_blockColorCreamMidnight ? resolveBg(stegaClean(section.field_blockColorCreamMidnight)) : 'cream';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Event Agenda Block'>
			<EventAgendaBlock
				backgroundColor={backgroundColor}
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: <RichData value={section.summaryInfo?.block_summaryText} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					caption: section.summaryInfo?.field_caption,
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				agendaTitle={section.field_agendaTitle}
				color={resolveIconColor(stegaClean(section.field_iconColor6ColorsWhiteMixed))}
				items={section.agendaItems?.list_iconContentItems?.map(item => ({
					_key: item._key,
					icon: item.field_icon,
					title: item.field_title,
					copy: <RichData value={item.block_summaryText} />,
				}))}
			/>
		</section>
	);
}
