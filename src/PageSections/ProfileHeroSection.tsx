import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import { PROFILE_HERO_INTRO_DEFAULTS } from '~/lib/profileHeroDefaults';
import { resolveTokens, type TokenMap } from '~/lib/resolveTokens';
import { ProfileHero } from '~/ui/ProfileHero';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Props = Extract<Sections, { _type: 'component_profileHero' }> & {
	profileHeroOverride?: SectionOverrides['component_profileHero'];
	/** Fills `[candidate name]` in the intro; PageSections passes it to every templated block. */
	tokens?: TokenMap;
};

export function ProfileHeroSection({ profileHeroOverride, tokens, ...section }: Props) {
	const backgroundColor = section.profileHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.profileHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	const candidateName = profileHeroOverride?.candidateName ?? 'Candidate Name';
	const office = profileHeroOverride?.office ?? 'Office Name';

	// The intro is a /people thing: only a page that says who the person is
	// (candidate or elected official) gets one, and it picks the matching Studio
	// field. A template saved before the fields existed has no value, so the
	// shared preset stands in — the same words a freshly added block starts with.
	const subject = profileHeroOverride?.subject;
	const authoredIntro =
		subject === 'elected official'
			? section.profileHeroContent?.field_introOfficeholders
			: section.profileHeroContent?.field_introCandidates;
	const defaultIntro = subject === 'elected official' ? PROFILE_HERO_INTRO_DEFAULTS.officeholder : PROFILE_HERO_INTRO_DEFAULTS.candidate;
	const intro = subject ? resolveTokens(stegaClean(authoredIntro)?.trim() || defaultIntro, tokens) : undefined;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Profile Hero'>
			<ProfileHero
				backgroundColor={backgroundColor}
				candidateName={candidateName}
				office={office}
				officeHref={profileHeroOverride?.officeHref}
				secondaryOffice={profileHeroOverride?.secondaryOffice}
				secondaryOfficeHref={profileHeroOverride?.secondaryOfficeHref}
				intro={intro}
				profileImageUrl={profileHeroOverride?.profileImageUrl}
				isEmpowered={profileHeroOverride?.isEmpowered}
				tags={profileHeroOverride?.tags}
				attribution={profileHeroOverride?.attribution}
				pledgeSubject={subject}
				showBrandMark={profileHeroOverride?.showBrandMark}
			/>
		</section>
	);
}
