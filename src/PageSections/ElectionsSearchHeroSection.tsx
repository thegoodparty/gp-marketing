import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { parseButtonStyleType } from '~/ui/_lib/resolveButtonStyleType';
import { ElectionsSearchHeroWithNav } from '~/ui/ElectionsSearchHeroWithNav';
import { US_STATES } from '~/constants/usStates';

export function ElectionsSearchHeroSection(section: Extract<Sections, { _type: 'component_electionsSearchHero' }>) {
	const rawButtonStyle = stegaClean(section.ctaAction?.field_buttonStyle);
	const buttonStyle = parseButtonStyleType(rawButtonStyle);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Search Hero'>
			<ElectionsSearchHeroWithNav
				showLogo={stegaClean(section.logoSettings?.showLogo) ?? true}
				logoImage={section.logoSettings?.img_logoImage}
				headerText={section.electionsSearchHeroContent?.field_headerText}
				bodyCopy={section.electionsSearchHeroContent?.field_bodyCopy}
				backgroundImage={section.electionsSearchHeroDesignSettings?.img_backgroundImage}
				backgroundColor={
					section.electionsSearchHeroDesignSettings?.field_backgroundColor
						? stegaClean(section.electionsSearchHeroDesignSettings.field_backgroundColor)
						: undefined
				}
				states={US_STATES}
				cta={{
					buttonType: 'button',
					label: section.ctaAction?.field_buttonText ?? 'Search',
					buttonProps: {
						styleType: buttonStyle,
					},
				}}
			/>
		</section>
	);
}
