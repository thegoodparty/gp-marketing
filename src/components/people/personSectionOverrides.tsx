import type { ReactNode } from 'react';

import type { PersonProfileView, PersonPersona, RelatedPersonCard } from '~/lib/peopleProfile';
import { formatElectionDateFromApi } from '~/lib/electionsHelpers';
import type { PersonAccomplishment, PersonProfileIssueStatus } from '~/types/people';
import { mapAttribution, mapStyleUrl } from '~/lib/env';
import type { SectionOverrides } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import type { CandidateCard } from '~/ui/CandidatesBlock';
import type { ElectionItem } from '~/ui/ElectionsIndexBlock';
import type { ProfileContentCardProps } from '~/ui/ProfileContentCard';
import type { ElectionsSidebarProps } from '~/ui/ElectionsSidebar';
import { Container } from '~/ui/Container';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';
import { VoterDensityMapCard } from './VoterDensityMapCard';
import { PERSON_SECTION_KEYS } from './personProfileSections';

// Below this rendered-voter coverage the density surface is too partial to be
// trustworthy, so the map is hidden. Coverage may be null when upstream has no
// meta row; in that case we fall back to "render if there are cells at all".
const MIN_VOTER_DENSITY_COVERAGE = 0.5;

function whyHeading(persona: PersonPersona): string {
	switch (persona) {
		case 'candidate':
		case 'both':
			return 'Why I\u2019m Running';
		case 'officeholder':
			return 'Why I Serve';
		case 'past':
			return 'Why I Served';
	}
}

function issuesHeading(persona: PersonPersona): string {
	switch (persona) {
		case 'candidate':
		case 'both':
			return 'Top Issues';
		case 'officeholder':
			return 'Top Priorities in Office';
		case 'past':
			return 'Priorities in Office';
	}
}

const STATUS_LABELS: Record<PersonProfileIssueStatus, string> = {
	IN_PROGRESS: 'In Progress',
	PRIORITIZED: 'Prioritized',
	ONGOING: 'Ongoing',
	RESOLVED: 'Resolved',
};

function TypeTag({ icon, label }: { icon: string; label: string }) {
	return (
		<span className='inline-flex w-fit items-center gap-1.5 rounded-full bg-halo-green-100 px-3 py-1 text-midnight-900'>
			<IconResolver icon={icon} className='h-3.5 w-3.5' />
			<Text as='span' styleType='caption'>
				{label}
			</Text>
		</span>
	);
}

function IssuesContent({ issues }: { issues: PersonProfileView['issues'] }): ReactNode {
	return (
		<ol className='flex flex-col gap-6'>
			{issues.map((issue, index) => (
				<li key={issue.id} className='flex flex-col gap-2'>
					<div className='flex items-baseline gap-3'>
						<Text as='span' styleType='subtitle-1' className='text-btn-primary-bg'>
							{index + 1}
						</Text>
						<Text as='span' styleType='subtitle-1'>
							{issue.title}
						</Text>
					</div>
					{issue.description && (
						<div className='pl-7'>
							<Text styleType='body-2'>{issue.description}</Text>
						</div>
					)}
					{issue.status && (
						<div className='pl-7'>
							<TypeTag icon='badge-check' label={STATUS_LABELS[issue.status]} />
						</div>
					)}
				</li>
			))}
		</ol>
	);
}

function AccomplishmentsContent({ accomplishments }: { accomplishments: PersonAccomplishment[] }): ReactNode {
	return (
		<ul className='flex flex-col gap-5'>
			{accomplishments.map((item, index) => (
				<li key={`${item.title}-${index}`} className='flex flex-col gap-1'>
					<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
						<span className='inline-flex items-center gap-2'>
							<IconResolver icon='star' className='h-4 w-4 text-btn-primary-bg' />
							<Text as='span' styleType='subtitle-2'>
								{item.title}
							</Text>
						</span>
						{item.date && (
							<Text as='span' styleType='caption' className='text-gray-500'>
								{item.date}
							</Text>
						)}
						<TypeTag icon='badge-check' label='Resolved' />
					</div>
					{item.description && (
						<div className='pl-6'>
							<Text styleType='body-2'>{item.description}</Text>
						</div>
					)}
				</li>
			))}
		</ul>
	);
}

function ExperienceContent({ experience }: { experience: PersonProfileView['recentExperience'] }): ReactNode {
	return (
		<ul className='flex flex-col gap-5'>
			{experience.map((item, index) => (
				<li key={`${item.title}-${index}`} className='flex flex-col gap-1'>
					<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
						<Text as='span' styleType='subtitle-2'>
							{item.title}
						</Text>
						{item.term && (
							<Text as='span' styleType='caption' className='text-gray-500'>
								{item.term}
							</Text>
						)}
					</div>
					{item.organization && (
						<Text styleType='body-2' className='text-gray-600'>
							{item.organization}
						</Text>
					)}
				</li>
			))}
		</ul>
	);
}

/** Person-authored content cards (About/Why/Issues/Accomplishments/Experience). */
function buildAuthoredCards(view: PersonProfileView): ProfileContentCardProps[] {
	const cards: ProfileContentCardProps[] = [];
	if (view.bio) {
		cards.push({ cardType: 'about-me', heading: 'About', content: view.bio });
	}
	if (view.whyRunning) {
		cards.push({ cardType: 'why-running', heading: whyHeading(view.persona), content: view.whyRunning });
	}
	if (view.issues.length > 0) {
		cards.push({ cardType: 'top-issues', heading: issuesHeading(view.persona), content: <IssuesContent issues={view.issues} /> });
	}
	if (view.accomplishments.length > 0) {
		cards.push({ heading: 'Accomplishments', content: <AccomplishmentsContent accomplishments={view.accomplishments} /> });
	}
	if (view.recentExperience.length > 0) {
		cards.push({ heading: 'Recent Experience', content: <ExperienceContent experience={view.recentExperience} /> });
	}
	return cards;
}

function buildSidebar(view: PersonProfileView): ElectionsSidebarProps | undefined {
	const links = view.links.map(link => ({ label: link.label, icon: link.icon, href: link.href }));
	const location = [view.districtLabel, view.stateLabel].filter(Boolean).join(', ');
	const aboutOffice = [view.officeName, location].filter(Boolean).join(' · ') || undefined;
	const electionDate = view.electionDate ? formatElectionDateFromApi(view.electionDate) : undefined;

	if (links.length === 0 && !aboutOffice && !view.termLabel && !electionDate && !view.party) {
		return undefined;
	}

	return {
		links: links.length > 0 ? links : undefined,
		aboutOffice,
		termLength: view.termLabel ?? undefined,
		electionDate,
		party: view.party ?? undefined,
	};
}

/** Maps interlink cards to CandidatesBlock cards, dropping any without a link. */
function toCandidateCards(cards: RelatedPersonCard[]): CandidateCard[] {
	return cards
		.filter(c => Boolean(c.href))
		.map(c => ({
			_key: c.personId ?? c.name,
			name: c.name,
			partyAffiliation: c.subtitle ?? '',
			href: c.href as string,
			isGoodPartyCandidate: c.isEmpowered,
			...(c.avatarUrl ? { avatar: c.avatarUrl } : {}),
		}));
}

function buildDistrictMap(view: PersonProfileView): ReactNode | undefined {
	const density = view.voterDensity;
	const show = !!density && density.cells.length > 0 && (density.coverage === null || density.coverage >= MIN_VOTER_DENSITY_COVERAGE);
	if (!show || !density) return undefined;
	return (
		<section className='bg-goodparty-cream py-(--container-padding)' data-component='DistrictMap'>
			<Container size='xl'>
				<div className='mx-auto max-w-3xl'>
					<VoterDensityMapCard cells={density.cells} styleUrl={mapStyleUrl} attribution={mapAttribution} />
				</div>
			</Container>
		</section>
	);
}

/**
 * Maps a resolved PersonProfileView onto the `personProfile` template's section
 * overrides (keyed by section `_type`/`_key`). Per-state gating (empowerment,
 * removal, claim/pledge/CTA visibility) is expressed by suppressing sections —
 * so the same behaviour holds regardless of the (editor-authored) template.
 */
export function buildPersonSectionOverrides(view: PersonProfileView): SectionOverrides {
	const showClaim = view.empowered && !view.claimed;
	const showPledge = view.empowered && (view.persona === 'candidate' || view.persona === 'both');
	const showCTA = view.empowered;

	// Authored content is empowerment-gated; the About-position card (about the
	// office, not the person) shows whenever a description exists.
	const contentCards: ProfileContentCardProps[] = [
		...(view.empowered ? buildAuthoredCards(view) : []),
		...(view.positionDescription ? [{ heading: `About ${view.officeName ?? 'the Role'}`, content: view.positionDescription }] : []),
	];
	const sidebar = buildSidebar(view);
	const districtMap = buildDistrictMap(view);

	const otherCandidates = toCandidateCards(view.otherCandidates);
	const nearbyOfficials = toCandidateCards(view.nearbyOfficials);

	const elections: ElectionItem[] = view.electionsIndex?.entries.map(e => ({ name: e.name, href: e.href, level: e.level })) ?? [];

	return {
		component_breadcrumbBlock: {
			breadcrumbs: view.breadcrumb.map(b => ({ label: b.label, ...(b.href ? { href: b.href } : {}) })),
		},
		component_profileHero: {
			candidateName: view.displayName,
			office: view.roleTitle ?? '',
			profileImageUrl: view.avatarUrl ?? undefined,
			isEmpowered: view.empowered,
			pledged: view.pledged,
		},
		component_claimProfileBlock: {
			// The claim block self-suppresses when `claimed` is truthy; suppress it
			// for every state except the empowered-but-unclaimed CTA.
			claimed: !showClaim,
			candidateName: view.displayName,
			partyAffiliation: view.party ?? undefined,
			layout: 'banner',
			// Render the interactive claim/notify modal on unclaimed profiles so the
			// "notify" form carries the real personId through to ProfileClaimRequest.
			interactive: showClaim,
			personId: view.personId,
			displayName: view.displayName,
			persona: view.persona,
		},
		component_profileContentBlock: {
			contentCards,
			sidebar,
			hidden: contentCards.length === 0 && !sidebar,
		},
		// The district voter-density map is its own section now (so marketing can
		// reorder / toggle it independently); the content block no longer hosts it.
		component_voterDensityBlock: {
			map: districtMap,
			hidden: !districtMap,
		},
		component_candidatesBlock: {
			byKey: {
				[PERSON_SECTION_KEYS.otherCandidates]: {
					candidates: otherCandidates,
					header: {
						title: view.officeName ? `Other candidates for ${view.officeName}` : 'Other candidates',
					},
					hidden: otherCandidates.length === 0,
				},
				[PERSON_SECTION_KEYS.nearbyOfficials]: {
					candidates: nearbyOfficials,
					header: { title: 'Nearby elected officials' },
					hidden: nearbyOfficials.length === 0,
				},
			},
		},
		component_goodPartyOrgPledge: { hidden: !showPledge },
		component_electionsIndexBlock: {
			elections,
			stateSlug: view.electionsIndex?.stateSlug,
			hidden: elections.length === 0,
			header: view.electionsIndex
				? {
						title: `Explore elections in ${view.electionsIndex.stateName}`,
						copy: 'Find candidates and offices on the ballot near you.',
					}
				: undefined,
		},
		component_ctaBannerBlock: { hidden: !showCTA },
	};
}

export function buildPersonProfileTokens(view: PersonProfileView): TokenMap {
	return {
		'[candidate name]': view.displayName,
		'[office name]': view.officeName ?? 'Office',
	};
}
