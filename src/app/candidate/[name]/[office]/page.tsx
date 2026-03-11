import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCandidateBySlug, findCampaignByRace } from '~/lib/electionsApi';
import { formatElectionDateFromApi } from '~/lib/electionsHelpers';
import { defaultRevalidate } from '~/lib/env';
import { PageSections } from '~/PageSections';
import type { SectionOverrides } from '~/PageSections';
import type { CandidacyItem, FindByRaceIdResponse } from '~/types/elections';
import type { ProfileData, OfficeData } from '~/PageSections/ProfileContentBlockSection';
import { PROFILE_PAGE_SECTIONS } from './profilePageSections';

export const revalidate = defaultRevalidate;
export const dynamic = 'force-static';

function buildSectionOverrides(
	candidate: CandidacyItem,
	claimed: FindByRaceIdResponse | null,
): SectionOverrides {
	const candidateName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Candidate';
	const office = candidate.positionName ?? 'Office';
	const isClaimed = !!claimed;

	const profileData: ProfileData = {
		aboutMe: candidate.about,
		whyRunning: claimed?.details?.pastExperience,
		topIssues: buildTopIssues(candidate, claimed),
	};

	const links: OfficeData['links'] = [];
	if (candidate.urls?.length) {
		candidate.urls.forEach((url, i) => {
			links.push({
				label: i === 0 ? 'Website' : `Link ${i + 1}`,
				href: url,
			});
		});
	}
	if (candidate.email) {
		links.push({
			label: 'Email',
			href: `mailto:${candidate.email}`,
		});
	}
	if (claimed?.details?.website) {
		const hasWebsite = links.some((l) => l.label === 'Website');
		if (!hasWebsite) {
			links.unshift({ label: 'Website', href: claimed.details.website });
		}
	}

	const officeData: OfficeData = {
		links: links.length ? links : undefined,
		electionDate: candidate.Race?.electionDate
			? formatElectionDateFromApi(candidate.Race.electionDate)
			: undefined,
	};

	return {
		component_profileHero: {
			candidateName,
			office,
			profileImageUrl: candidate.image ?? undefined,
			isEmpowered: isClaimed,
		},
		component_profileContentBlock: {
			profileData,
			officeData,
		},
		component_claimProfileBlock: {
			claimed: isClaimed,
			candidateName,
			partyAffiliation: claimed?.details?.party ?? candidate.party,
		},
	};
}

function buildTopIssues(
	candidate: CandidacyItem,
	claimed: FindByRaceIdResponse | null,
): string | undefined {
	const parts: string[] = [];

	if (candidate.Stances?.length) {
		for (const s of candidate.Stances) {
			const title = s.Issue?.name ?? 'Issue';
			const desc = s.stanceStatement ?? '';
			if (desc) {
				parts.push(`${title}\n\n${desc}`);
			} else {
				parts.push(title);
			}
		}
	}

	if (claimed?.details?.customIssues?.length) {
		for (const ci of claimed.details.customIssues) {
			parts.push(`${ci.title}\n\n${ci.description}`);
		}
	}

	return parts.length ? parts.join('\n\n') : undefined;
}

export default async function Page({
	params,
}: {
	params: Promise<{ name: string; office: string }>;
}) {
	const { name, office } = await params;
	const slug = `${name}/${office}`;

	const candidate = await getCandidateBySlug({ slug });
	console.log('[candidate page] slug=%s found=%s', slug, !!candidate);
	if (!candidate) {
		notFound();
	}

	let claimed: FindByRaceIdResponse | null = null;
	const raceId = candidate.Race?.brHashId;
	if (raceId && candidate.firstName && candidate.lastName) {
		claimed = await findCampaignByRace({
			raceId,
			firstName: candidate.firstName,
			lastName: candidate.lastName,
		});
	}

	const sectionOverrides = buildSectionOverrides(candidate, claimed);

	return (
		<PageSections
			pageSections={PROFILE_PAGE_SECTIONS}
			sectionOverrides={sectionOverrides}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ name: string; office: string }>;
}): Promise<Metadata> {
	const { name, office } = await params;
	const slug = `${name}/${office}`;

	const candidate = await getCandidateBySlug({
		slug,
		includeStances: false,
		includeRace: false,
	});

	if (!candidate) {
		return { title: 'Candidate Not Found | Good Party' };
	}

	const candidateName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Candidate';
	const positionName = candidate.positionName ?? 'Office';

	return {
		title: `${candidateName} for ${positionName} | Good Party`,
		description: candidate.about ?? `View ${candidateName}'s profile for ${positionName}.`,
		openGraph: {
			images: candidate.image ? [{ url: candidate.image }] : undefined,
		},
	};
}
