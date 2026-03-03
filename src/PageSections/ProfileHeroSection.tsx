import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { ProfileHero } from '~/ui/ProfileHero';
import { resolveBg } from '~/ui/_lib/resolveBg';

export function ProfileHeroSection(section: Extract<Sections, { _type: 'component_profileHero' }>) {
	const backgroundColor = section.profileHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.profileHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	// TODO: Profile data (candidateName, office, profileImage) should be passed from profile data source
	// For now, using placeholder values
	const candidateName = 'Candidate Name';
	const office = 'Office Name';

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Profile Hero'>
			<ProfileHero
				backgroundColor={backgroundColor}
				candidateName={candidateName}
				office={office}
				// profileImage={profileData?.image}
			/>
		</section>
	);
}
