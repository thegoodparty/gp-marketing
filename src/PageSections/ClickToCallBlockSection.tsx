import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { ClickToCallBlock } from '~/ui/ClickToCallBlock';

export function ClickToCallBlockSection(section: Extract<Sections, { _type: 'component_clickToCallBlock' }>) {
	const backgroundColor = section.ctaBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.ctaBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const color = resolveComponentColor(
		stegaClean(section.ctaBlockDesignSettings?.field_componentColor6ColorsInverse),
		backgroundColor,
	);

	const anchorId = section.componentSettings?.field_anchorId;

	return (
		<section
			data-section='Click to Call Block'
			id={anchorId ? stegaClean(anchorId)?.trim() || undefined : undefined}
		>
			<ClickToCallBlock
				preframingText={section.field_preframingText ?? ''}
				inputPrompt={section.field_inputPrompt ?? ''}
				buttonText={section.field_buttonText ?? 'Talk through my race'}
				microcopy={section.field_microcopy ?? ''}
				phoneNumberDisplay={section.field_phoneNumber ?? ''}
				responseTime={section.field_responseTime ?? ''}
				backgroundColor={backgroundColor}
				color={color}
			/>
		</section>
	);
}
