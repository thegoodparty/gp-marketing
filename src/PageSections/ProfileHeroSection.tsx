import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import { ProfileHero } from '~/ui/ProfileHero';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Props = Extract<Sections, { _type: 'component_profileHero' }> & {
	profileHeroOverride?: SectionOverrides['component_profileHero'];
};

export function ProfileHeroSection({ profileHeroOverride, ...section }: Props) {
	const backgroundColor = section.profileHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.profileHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	const candidateName = profileHeroOverride?.candidateName ?? 'Candidate Name';
	const office = profileHeroOverride?.office ?? 'Office Name';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Profile Hero'>
			<ProfileHero
				backgroundColor={backgroundColor}
				candidateName={candidateName}
				office={office}
				profileImageUrl={profileHeroOverride?.profileImageUrl}
				isEmpowered={profileHeroOverride?.isEmpowered}
			/>
		</section>
	);
}
