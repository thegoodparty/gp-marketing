import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { ElectionsSearchHero } from '~/ui/ElectionsSearchHero';

// US States for the dropdown
const US_STATES = [
	{ value: 'AL', label: 'Alabama' },
	{ value: 'AK', label: 'Alaska' },
	{ value: 'AZ', label: 'Arizona' },
	{ value: 'AR', label: 'Arkansas' },
	{ value: 'CA', label: 'California' },
	{ value: 'CO', label: 'Colorado' },
	{ value: 'CT', label: 'Connecticut' },
	{ value: 'DE', label: 'Delaware' },
	{ value: 'FL', label: 'Florida' },
	{ value: 'GA', label: 'Georgia' },
	{ value: 'HI', label: 'Hawaii' },
	{ value: 'ID', label: 'Idaho' },
	{ value: 'IL', label: 'Illinois' },
	{ value: 'IN', label: 'Indiana' },
	{ value: 'IA', label: 'Iowa' },
	{ value: 'KS', label: 'Kansas' },
	{ value: 'KY', label: 'Kentucky' },
	{ value: 'LA', label: 'Louisiana' },
	{ value: 'ME', label: 'Maine' },
	{ value: 'MD', label: 'Maryland' },
	{ value: 'MA', label: 'Massachusetts' },
	{ value: 'MI', label: 'Michigan' },
	{ value: 'MN', label: 'Minnesota' },
	{ value: 'MS', label: 'Mississippi' },
	{ value: 'MO', label: 'Missouri' },
	{ value: 'MT', label: 'Montana' },
	{ value: 'NE', label: 'Nebraska' },
	{ value: 'NV', label: 'Nevada' },
	{ value: 'NH', label: 'New Hampshire' },
	{ value: 'NJ', label: 'New Jersey' },
	{ value: 'NM', label: 'New Mexico' },
	{ value: 'NY', label: 'New York' },
	{ value: 'NC', label: 'North Carolina' },
	{ value: 'ND', label: 'North Dakota' },
	{ value: 'OH', label: 'Ohio' },
	{ value: 'OK', label: 'Oklahoma' },
	{ value: 'OR', label: 'Oregon' },
	{ value: 'PA', label: 'Pennsylvania' },
	{ value: 'RI', label: 'Rhode Island' },
	{ value: 'SC', label: 'South Carolina' },
	{ value: 'SD', label: 'South Dakota' },
	{ value: 'TN', label: 'Tennessee' },
	{ value: 'TX', label: 'Texas' },
	{ value: 'UT', label: 'Utah' },
	{ value: 'VT', label: 'Vermont' },
	{ value: 'VA', label: 'Virginia' },
	{ value: 'WA', label: 'Washington' },
	{ value: 'WV', label: 'West Virginia' },
	{ value: 'WI', label: 'Wisconsin' },
	{ value: 'WY', label: 'Wyoming' },
];

export function ElectionsSearchHeroSection(section: Extract<Sections, { _type: 'component_electionsSearchHero' }>) {
	const buttonStyle = stegaClean(section.ctaAction?.field_buttonStyle) ?? 'primary';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Search Hero'>
			<ElectionsSearchHero
				showLogo={stegaClean(section.logoSettings?.showLogo) ?? true}
				logoImage={section.logoSettings?.img_logoImage}
				headerText={section.electionsSearchHeroContent?.field_headerText}
				bodyCopy={section.electionsSearchHeroContent?.field_bodyCopy}
				backgroundImage={section.electionsSearchHeroDesignSettings?.img_backgroundImage}
				backgroundColor={
					section.electionsSearchHeroDesignSettings?.field_backgroundColor
						? stegaClean(section.electionsSearchHeroDesignSettings.field_backgroundColor) as 'cream' | 'midnight'
						: undefined
				}
				states={US_STATES}
				cta={{
					buttonType: 'button',
					label: section.ctaAction?.field_buttonText ?? 'Search',
					buttonProps: {
						styleType: buttonStyle as 'primary' | 'secondary' | 'outline',
					},
				}}
			/>
		</section>
	);
}
