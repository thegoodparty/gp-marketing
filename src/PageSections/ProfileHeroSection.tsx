import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { Container } from '~/ui/Container';
import { IconResolver } from '~/ui/IconResolver';
import { ProfileHero } from '~/ui/ProfileHero';
import { Text } from '~/ui/Text';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Props = Extract<Sections, { _type: 'component_profileHero' }> & {
	profileHeroOverride?: SectionOverrides['component_profileHero'];
	// Profile name/office are supplied via profileHeroOverride; tokens accepted for a
	// consistent section signature (PageSections passes it to every templated block).
	tokens?: TokenMap;
};

export function ProfileHeroSection({ profileHeroOverride, tokens: _tokens, ...section }: Props) {
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
			{profileHeroOverride?.pledged && (
				<div className='bg-goodparty-cream'>
					<Container size='xl'>
						<div className='py-4'>
							<span className='inline-flex w-fit items-center gap-1.5 rounded-full bg-halo-green-100 px-3 py-1 text-midnight-900'>
								<IconResolver icon='badge-check' className='h-3.5 w-3.5' />
								<Text as='span' styleType='caption'>
									Took the GoodParty.org Pledge
								</Text>
							</span>
						</div>
					</Container>
				</div>
			)}
		</section>
	);
}
