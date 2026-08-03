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
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';
import { ButtonLink } from '~/ui/Inputs/Button';
import { CandidatesCard } from '~/ui/CandidatesCard';
import { VoterDensityMapCard } from './VoterDensityMapCard';
import { ClaimProfileModal } from './ClaimProfileModal';
import { PersonClaimCTABand } from './PersonClaimCTABand';

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

/** Small persona tag pill(s) rendered above the hero name (Figma). */
function personaTags(persona: PersonPersona): string[] {
	switch (persona) {
		case 'candidate':
			return ['Candidate'];
		case 'officeholder':
			return ['Incumbent'];
		case 'both':
			return ['Candidate', 'Incumbent'];
		case 'past':
			return ['Former Official'];
	}
}

function issuesHeading(persona: PersonPersona): string {
	switch (persona) {
		case 'candidate':
		case 'both':
			return 'Campaign Issues';
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

// Inline "Pro Blocks / Tagline" pill from Figma: white fill, hairline gray border,
// rounded-md, subtle shadow, no icon. Used for persona/status tags on the content
// sections (Recent Experience, Accomplishments, Issues, Other Candidates).
function TypeTag({ label }: { label: string }) {
	return (
		<span className='inline-flex w-fit shrink-0 items-center rounded-[6px] border border-gray-300 bg-white px-2.5 py-1 text-midnight-900 shadow-xs'>
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
							<TypeTag label={STATUS_LABELS[issue.status]} />
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
					<div className='flex items-start justify-between gap-3'>
						<div className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1'>
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
						</div>
						<TypeTag label='Resolved' />
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
					<div className='flex items-center justify-between gap-3'>
						<Text as='span' styleType='subtitle-2'>
							{item.title}
						</Text>
						{item.status && <TypeTag label={item.status} />}
					</div>
					<div className='flex items-center justify-between gap-3'>
						{item.term && (
							<Text as='span' styleType='body-2' className='text-gray-500'>
								{item.term}
							</Text>
						)}
						{item.href && (
							<a
								href={item.href}
								className='inline-flex w-fit items-center gap-1 text-btn-primary-bg hover:underline'
							>
								<Text as='span' styleType='caption'>
									View Position
								</Text>
								<IconResolver icon='arrow-up-right' className='h-3.5 w-3.5' />
							</a>
						)}
					</div>
				</li>
			))}
		</ul>
	);
}

/**
 * Structured "About [position]" card body (Figma): a short description plus a
 * definition list of Term length / Next election, when the spine supplies them.
 */
function AboutPositionContent({ view }: { view: PersonProfileView }): ReactNode {
	const electionDate = view.electionDate ? formatElectionDateFromApi(view.electionDate) : null;
	const rows: Array<{ label: string; value: string }> = [];
	if (view.termLabel) rows.push({ label: 'Term length', value: view.termLabel });
	if (electionDate) rows.push({ label: 'Next election', value: electionDate });
	return (
		<div className='flex flex-col gap-4'>
			{view.positionDescription && <Text styleType='body-2'>{view.positionDescription}</Text>}
			{rows.length > 0 && (
				<dl className='flex flex-col gap-2'>
					{rows.map(r => (
						<div key={r.label} className='flex items-baseline justify-between gap-4'>
							<Text as='dt' styleType='caption' className='text-gray-500'>
								{r.label}
							</Text>
							<Text as='dd' styleType='subtitle-2'>
								{r.value}
							</Text>
						</div>
					))}
				</dl>
			)}
			{view.positionHref && (
				<ButtonLink
					parent='PersonProfileAboutPosition'
					href={view.positionHref}
					styleType='secondary'
					styleSize='sm'
					className='w-fit'
					iconRight={<IconResolver icon='arrow-right' className='h-4 w-4' />}
				>
					Learn more
				</ButtonLink>
			)}
		</div>
	);
}

/**
 * Person-authored content cards, in Figma order: Why → Campaign Issues → About
 * Me → Accomplishments. These are empowerment-gated (only shown on empowered
 * pages). Recent Experience is NOT here — it's a civics-spine card that renders
 * on every state (see buildCivicCards).
 */
function buildAuthoredCards(view: PersonProfileView): ProfileContentCardProps[] {
	const cards: ProfileContentCardProps[] = [];
	if (view.whyRunning) {
		cards.push({ cardType: 'why-running', heading: whyHeading(view.persona), content: view.whyRunning });
	}
	if (view.issues.length > 0) {
		cards.push({ cardType: 'top-issues', heading: issuesHeading(view.persona), content: <IssuesContent issues={view.issues} /> });
	}
	if (view.bio) {
		cards.push({ cardType: 'about-me', heading: 'About Me', content: view.bio });
	}
	if (view.accomplishments.length > 0) {
		cards.push({ heading: 'Accomplishments', content: <AccomplishmentsContent accomplishments={view.accomplishments} /> });
	}
	return cards;
}

/** Muted, italic prompt copy used inside unclaimed placeholder cards. */
function PlaceholderPrompt({ children }: { children: ReactNode }): ReactNode {
	return (
		<Text styleType='body-2' className='text-gray-500 italic'>
			{children}
		</Text>
	);
}

/**
 * Copy for the "Why …" placeholder prompt, phrased as a genuine, name + office
 * question so the section stays indexable and useful rather than an empty state.
 */
function whyPrompt(view: PersonProfileView): string {
	const { displayName, persona } = view;
	const office = view.officeName ?? 'their office';
	switch (persona) {
		case 'candidate':
		case 'both':
			return `What would ${displayName} prioritize in office? Their platform and reasons for running will appear here once they claim their profile.`;
		case 'officeholder':
			return `How does ${displayName} approach serving ${office}? Their motivations and priorities in office will appear here once they claim their profile.`;
		case 'past':
			return `Why did ${displayName} serve ${office}? Their story and reasons for serving will appear here once they claim their profile.`;
	}
}

/** Copy for the "Campaign Issues / Priorities" placeholder prompt. */
function issuesPrompt(view: PersonProfileView): string {
	const { displayName, persona } = view;
	const office = view.officeName;
	switch (persona) {
		case 'candidate':
		case 'both':
			return `Which issues would ${displayName} champion${office ? ` as ${office}` : ''}? Their campaign priorities will appear here once they claim their profile.`;
		case 'officeholder':
			return `What are ${displayName}'s top priorities${office ? ` for ${office}` : ''}? Their agenda in office will appear here once they claim their profile.`;
		case 'past':
			return `Which priorities did ${displayName} focus on${office ? ` in ${office}` : ' in office'}? Their record will appear here once they claim their profile.`;
	}
}

/** Copy for the "About Me" placeholder prompt. */
function aboutPrompt(view: PersonProfileView): string {
	const office = view.officeName ? ` for ${view.officeName}` : '';
	return `Get to know ${view.displayName}. Their background, experience, and story${office} will appear here once they claim their profile.`;
}

/**
 * Placeholder prompt cards shown in the authored-cards slot for UNCLAIMED but
 * empowered pages (Figma states D/E/F/H). They mirror the authored cards' Figma
 * order and persona-aware headings (Why → Campaign Issues → About Me) but carry
 * muted, name + office prompt copy inviting engagement, since there is no
 * owner-authored content yet. Accomplishments is intentionally omitted (Figma
 * does not show a placeholder for it).
 */
function buildAuthoredPlaceholderCards(view: PersonProfileView): ProfileContentCardProps[] {
	return [
		{ cardType: 'why-running', heading: whyHeading(view.persona), content: <PlaceholderPrompt>{whyPrompt(view)}</PlaceholderPrompt> },
		{ cardType: 'top-issues', heading: issuesHeading(view.persona), content: <PlaceholderPrompt>{issuesPrompt(view)}</PlaceholderPrompt> },
		{ cardType: 'about-me', heading: 'About Me', content: <PlaceholderPrompt>{aboutPrompt(view)}</PlaceholderPrompt> },
	];
}

/** In-column "Other candidates" list — a vertical stack of candidate cards. */
function OtherCandidatesContent({ cards }: { cards: CandidateCard[] }): ReactNode {
	return (
		<div className='flex flex-col gap-4'>
			{cards.map(card => (
				<CandidatesCard key={card._key ?? card.name} {...card} />
			))}
		</div>
	);
}

/**
 * Civics-spine content cards shown on every state (data permitting), in Figma
 * order after the authored cards: Recent Experience → Other candidates →
 * About [position] → District Information (voter-density map). These are NOT
 * empowerment-gated, so unclaimed major-party (I/J) and removed (K/L) pages
 * still render their public-record context per the Figma removal frames.
 */
function buildCivicCards(view: PersonProfileView): ProfileContentCardProps[] {
	const cards: ProfileContentCardProps[] = [];
	if (view.recentExperience.length > 0) {
		cards.push({ heading: 'Recent Experience', content: <ExperienceContent experience={view.recentExperience} /> });
	}
	const otherCandidates = toCandidateCards(view.otherCandidates);
	if (otherCandidates.length > 0) {
		cards.push({
			heading: view.officeName ? `Other candidates for ${view.officeName}` : 'Other candidates',
			content: <OtherCandidatesContent cards={otherCandidates} />,
		});
	}
	// Nearby officials serving the same constituency — only for personas actually
	// in (or formerly in) office, per Figma (candidate-only pages omit this).
	const holdsOffice = view.persona === 'officeholder' || view.persona === 'both' || view.persona === 'past';
	const nearby = holdsOffice ? toCandidateCards(view.nearbyOfficials) : [];
	if (nearby.length > 0) {
		cards.push({ heading: 'Nearby Officials', content: <OtherCandidatesContent cards={nearby} /> });
	}
	if (view.positionDescription || view.termLabel || view.electionDate) {
		cards.push({
			heading: `About ${view.officeName ?? 'the Role'}`,
			content: <AboutPositionContent view={view} />,
		});
	}
	const districtMap = buildDistrictMap(view);
	if (districtMap) {
		cards.push({ heading: 'District information', content: districtMap });
	}
	return cards;
}

/** Contact links that render as icon-only buttons in the Figma "Contact" row. */
const SIDEBAR_ICON_KINDS = new Set(['website', 'government', 'instagram', 'tiktok', 'facebook', 'twitter', 'linkedin']);

/** Strips mailto:/tel: so the "Office Contact" link shows a human-readable value. */
function contactLinkLabel(href: string): string {
	return href.replace(/^mailto:/, '').replace(/^tel:/, '');
}

/**
 * Builds the Figma person-profile sidebar: a single card of divider-separated
 * rows — Election Date / Current Term, Political Affiliation, a Contact icon
 * row, and (only for someone currently in office) Office Contact + Office
 * Mailing Address. See the A/J Figma frames.
 */
function buildSidebar(view: PersonProfileView): ElectionsSidebarProps | undefined {
	const inOffice = view.currentOffice?.isCurrent === true;
	const running = view.persona === 'candidate' || view.persona === 'both';

	// Leading rows: "Election Date" for anyone running now (or a past holder's last
	// race), plus "Current Term" for anyone currently in office. Persona "both"
	// shows both rows, matching the Figma frame.
	const topInfos: { icon: string; label: string; value: string }[] = [];
	if (view.electionDate && (running || view.persona === 'past')) {
		topInfos.push({ icon: 'calendar', label: 'Election Date', value: formatElectionDateFromApi(view.electionDate) });
	}
	if (inOffice && view.termLabel) {
		topInfos.push({ icon: 'calendar', label: 'Current Term', value: view.termLabel });
	}

	const contactIcons = view.links
		.filter(l => SIDEBAR_ICON_KINDS.has(l.kind))
		.map(l => ({ icon: l.icon, href: l.href, label: l.label }));

	// Office contact/address only appear for someone currently in office (Figma
	// shows them on officeholder frames, not candidate/past ones).
	const officeContacts = inOffice
		? view.links
				.filter(l => l.kind === 'email' || l.kind === 'phone')
				.map(l => ({ icon: l.icon, href: l.href, label: contactLinkLabel(l.href) }))
		: [];
	const officeAddress = inOffice ? (view.officeAddress ?? []) : [];

	if (
		topInfos.length === 0 &&
		!view.party &&
		contactIcons.length === 0 &&
		officeContacts.length === 0 &&
		officeAddress.length === 0
	) {
		return undefined;
	}

	return {
		topInfos: topInfos.length > 0 ? topInfos : undefined,
		politicalAffiliation: view.party ?? undefined,
		contactIcons: contactIcons.length > 0 ? contactIcons : undefined,
		officeContacts: officeContacts.length > 0 ? officeContacts : undefined,
		officeAddress: officeAddress.length > 0 ? officeAddress : undefined,
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
			href: c.href!,
			isGoodPartyCandidate: c.isEmpowered,
			...(c.avatarUrl ? { avatar: c.avatarUrl } : {}),
		}));
}

/**
 * The voter-density map node, embedded in-column inside the "District
 * Information" content card (per Figma) rather than as a full-width section.
 * Gated on sufficient rendered-voter coverage.
 */
function buildDistrictMap(view: PersonProfileView): ReactNode | undefined {
	const density = view.voterDensity;
	const show = !!density && density.cells.length > 0 && (density.coverage === null || density.coverage >= MIN_VOTER_DENSITY_COVERAGE);
	if (!show || !density) return undefined;
	return (
		<div data-component='DistrictMap'>
			<VoterDensityMapCard cells={density.cells} styleUrl={mapStyleUrl} attribution={mapAttribution} />
		</div>
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
	// The pledge explainer is claimed content across every persona (Figma A/B/C/G
	// all show it once claimed). Unclaimed empowered pages lead with the claim
	// prompt instead, so it stays hidden there.
	const showPledge = view.claimed;

	// The person-profile CTA band sits below the content well (Figma order):
	//  - claimed (A/B/C/G)   → generic centered "Join the movement" sign-up CTA
	//  - unclaimed empowered (D/E/F/H) → full-width interactive claim CTA band
	//    ("Are you …? Complete your profile now." + inline name/email form)
	//  - major-party (I/J) + removed (K/L) → no CTA band
	const ctaOverride: SectionOverrides['component_ctaBannerBlock'] = view.claimed
		? {
				align: 'center',
				title: 'Join the movement to build a better democracy.',
				copy: 'GoodParty.org is on a mission to make people matter more than money in our democracy. Learn how you can become part of the movement for change.',
				// Figma shows a dark navy filled button on the light-blue card. That is
				// the `secondary` style (bg-midnight-900); preserveButtonStyle skips the
				// card-color inverse mapping that would otherwise turn it into a light
				// `outline` button.
				button: { buttonType: 'signup', label: 'Learn more', buttonProps: { styleType: 'secondary', styleSize: 'md' } },
				preserveButtonStyle: true,
				// The CTA sits below the asymmetric sidebar + cards layout; align its
				// centered content with the content-card column above (not the page
				// middle) so it reads as continuous with the last card.
				contentColumnAlign: true,
			}
		: showClaim
			? {
					render: (
						<PersonClaimCTABand
							personId={view.personId}
							displayName={view.displayName}
							isRunning={view.persona === 'candidate' || view.persona === 'both'}
						/>
					),
				}
			: { hidden: true };

	// The Figma content well is one column of cards. For unclaimed empowered
	// pages a voter-facing "hear from …" claim card leads the column; the
	// person-facing "Are you …?" prompt is NOT in-column — it renders as the
	// full-width claim CTA band below the well (see `ctaOverride`). Between the
	// voter card and the civics cards: authored cards (empowerment-gated) then
	// the civics-spine cards (Recent Experience → Other candidates → Nearby
	// officials → About position → District map) that render on every state.
	const claimCard = (variant: 'voter-card' | 'owner-card'): ProfileContentCardProps => ({
		raw: true,
		content: (
			<ClaimProfileModal
				personId={view.personId}
				displayName={view.displayName}
				persona={view.persona}
				variant={variant}
			/>
		),
	});
	// Authored slot: claimed pages show real owner content; unclaimed but
	// empowered pages (Figma D/E/F/H) show muted placeholder prompt cards in the
	// same slot; major-party (I/J) and removed (K/L) pages show neither.
	const authoredCards = view.claimed
		? buildAuthoredCards(view)
		: view.empowered
			? buildAuthoredPlaceholderCards(view)
			: [];
	const contentCards: ProfileContentCardProps[] = [
		...(showClaim ? [claimCard('voter-card')] : []),
		...authoredCards,
		...buildCivicCards(view),
	];
	const sidebar = buildSidebar(view);

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
			tags: personaTags(view.persona),
			// Empowered pages carry the GoodParty attribution; major-party (I/J) and
			// removed (K/L) pages show the neutral "Not Endorsed" line instead.
			attribution: view.empowered ? 'empowered' : 'notEndorsed',
		},
		component_claimProfileBlock: {
			// The standalone full-width claim banner is always suppressed now: the
			// claim prompt renders in-column as light-blue cards inside the content
			// well (see `claimCard` above), matching the Figma layout.
			claimed: true,
		},
		component_profileContentBlock: {
			contentCards,
			sidebar,
			hidden: contentCards.length === 0 && !sidebar,
		},
		component_goodPartyOrgPledge: { hidden: !showPledge },
		component_electionsIndexBlock: {
			elections,
			stateSlug: view.electionsIndex?.stateSlug,
			hidden: elections.length === 0,
			header: view.electionsIndex
				? {
						title: 'Explore elections near you',
						copy: 'Find candidates and offices on the ballot near you.',
					}
				: undefined,
		},
		component_ctaBannerBlock: ctaOverride,
	};
}

export function buildPersonProfileTokens(view: PersonProfileView): TokenMap {
	return {
		'[candidate name]': view.displayName,
		'[office name]': view.officeName ?? 'Office',
	};
}
