import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { ProfileContentBlock } from '~/ui/ProfileContentBlock';
import { resolveBg } from '~/ui/_lib/resolveBg';
import type { ProfileContentCardProps } from '~/ui/ProfileContentCard';
import type { ElectionsSidebarProps } from '~/ui/ElectionsSidebar';

export type ProfileData = {
	aboutMe?: string;
	whyRunning?: string;
	topIssues?: string;
};

export type OfficeData = {
	officeName?: string;
	filingPeriodStart?: string;
	filingPeriodEnd?: string;
	ctaHref?: string;
	ctaLabel?: string;
};

function getProfileContentCards(profileData: ProfileData): ProfileContentCardProps[] {
	const cards: ProfileContentCardProps[] = [];

	if (profileData.aboutMe) {
		cards.push({
			cardType: 'about-me',
			heading: 'About Me',
			content: profileData.aboutMe,
		});
	}

	if (profileData.whyRunning) {
		cards.push({
			cardType: 'why-running',
			heading: 'Why I am Running',
			content: profileData.whyRunning,
		});
	}

	if (profileData.topIssues) {
		cards.push({
			cardType: 'top-issues',
			heading: 'Top Issues',
			content: profileData.topIssues,
		});
	}

	return cards;
}

function getSidebarData(officeData: OfficeData): ElectionsSidebarProps | undefined {
	if (!officeData.officeName && !officeData.filingPeriodStart && !officeData.filingPeriodEnd) {
		return undefined;
	}

	return {
		officeName: officeData.officeName,
		filingPeriodStart: officeData.filingPeriodStart,
		filingPeriodEnd: officeData.filingPeriodEnd,
		cta:
			officeData.ctaHref && officeData.ctaLabel
				? {
						buttonType: 'internal',
						href: officeData.ctaHref,
						label: officeData.ctaLabel,
						buttonProps: {
							styleType: 'primary',
						},
					}
				: undefined,
	};
}

export function ProfileContentBlockSection(
	section: Extract<Sections, { _type: 'component_profileContentBlock' }>,
	profileData?: ProfileData,
	officeData?: OfficeData,
) {
	const backgroundColor = section.profileContentBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.profileContentBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const contentCards = profileData ? getProfileContentCards(profileData) : [];
	const sidebar = officeData ? getSidebarData(officeData) : undefined;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Profile Content Block'>
			<ProfileContentBlock backgroundColor={backgroundColor} sidebar={sidebar} contentCards={contentCards} />
		</section>
	);
}
