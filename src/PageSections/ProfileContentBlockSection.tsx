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
	links?: Array<{ label: string; icon?: string; href: string }>;
	aboutOffice?: string;
	termLength?: string;
	electionDate?: string;
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
	if (
		!officeData.links?.length &&
		!officeData.aboutOffice &&
		!officeData.termLength &&
		!officeData.electionDate &&
		!officeData.ctaHref
	) {
		return undefined;
	}

	return {
		links: officeData.links,
		aboutOffice: officeData.aboutOffice,
		termLength: officeData.termLength,
		electionDate: officeData.electionDate,
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

type ProfileContentBlockSectionProps = Extract<Sections, { _type: 'component_profileContentBlock' }> & {
	profileData?: ProfileData;
	officeData?: OfficeData;
};

export function ProfileContentBlockSection({
	profileData,
	officeData,
	...section
}: ProfileContentBlockSectionProps) {
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
