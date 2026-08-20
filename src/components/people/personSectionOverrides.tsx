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
import { cn } from '~/ui/_lib/utils';
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

// Pre-footer "Explore elections near you" body copy, keyed by the index tier so
// the prompt matches the level the list drills into (verbatim from the frames).
const ELECTIONS_INDEX_COPY: Record<'state' | 'county' | 'city', string> = {
	state: 'Select your state to see local offices, candidates, and elected officials.',
	county: 'Select your county to see local offices, candidates, and elected officials.',
	city: 'Select your city to see local offices, candidates, and elected officials.',
};

// Only candidate/both personas render the "Why" card (Figma frame A heading is
// "Why I'm Running for Office"). Officeholder/past frames drop it, so those cases
// are never reached — they exist only to keep the switch exhaustive.
function whyHeading(persona: PersonPersona): string {
	switch (persona) {
		case 'candidate':
		case 'both':
			return 'Why I\u2019m Running for Office';
		case 'officeholder':
			return 'Why I Serve';
		case 'past':
			return 'Why I Served';
	}
}

/**
 * The content sections a profile can show, named after the Figma frames. The
 * issues list splits in two: the campaign platform (issues with no in-office
 * status) and the in-office record (issues carrying a status tag).
 */
type SectionKey =
	| 'why'
	| 'campaignIssues'
	| 'aboutMe'
	| 'recentExperience'
	| 'otherCandidates'
	| 'inOfficePriorities'
	| 'accomplishments'
	| 'aboutPosition'
	| 'district'
	| 'nearbyOfficials';

/**
 * Section order per persona, read off the Figma frames: A 1901:50309,
 * B 1901:52117, C 1901:53123, G 1958:110869. The frames genuinely differ —
 * a candidate meets the other candidates before the office, an office-holder
 * leads with their in-office record and sees the district before the office,
 * and the past frame opens with About Me. Assuming one shared order is what
 * kept regressing against the designs, so each persona owns its list and the
 * order alone decides which sections a persona shows.
 */
const SECTION_ORDER: Record<PersonPersona, SectionKey[]> = {
	candidate: ['why', 'campaignIssues', 'aboutMe', 'recentExperience', 'otherCandidates', 'aboutPosition', 'district'],
	officeholder: ['inOfficePriorities', 'accomplishments', 'aboutMe', 'recentExperience', 'district', 'aboutPosition', 'nearbyOfficials'],
	both: ['why', 'campaignIssues', 'aboutMe', 'recentExperience', 'otherCandidates', 'inOfficePriorities', 'accomplishments', 'aboutPosition', 'district', 'nearbyOfficials'],
	past: ['aboutMe', 'recentExperience', 'why', 'campaignIssues', 'inOfficePriorities', 'accomplishments', 'district', 'aboutPosition', 'nearbyOfficials', 'otherCandidates'],
};

/**
 * Adjacent sections sharing a group collapse into one white card (see
 * `chunkCardGroups` in ProfileContentBlock) — how the frames bundle Why with
 * Campaign Issues, About Me with Recent Experience, and the in-office record.
 * Other Candidates and Nearby Officials take distinct groups so the past
 * frame, where they sit next to each other, still renders two cards.
 */
const SECTION_GROUP: Record<SectionKey, string> = {
	why: 'platform',
	campaignIssues: 'platform',
	aboutMe: 'about',
	recentExperience: 'about',
	otherCandidates: 'candidates',
	inOfficePriorities: 'inoffice',
	accomplishments: 'inoffice',
	aboutPosition: 'position',
	district: 'district',
	nearbyOfficials: 'nearby',
};

type SectionMap = Partial<Record<SectionKey, ProfileContentCardProps>>;

/** Issues carrying a status are the in-office record; the rest are the platform. */
function splitIssues(issues: PersonProfileView['issues']) {
	return {
		platform: issues.filter(issue => !issue.status),
		inOffice: issues.filter(issue => issue.status),
	};
}

/** Stable empowered-first ordering (Figma puts the GoodParty candidate on top). */
function empoweredFirst(cards: CandidateCard[]): CandidateCard[] {
	return [
		...cards.filter(c => c.isGoodPartyCandidate),
		...cards.filter(c => !c.isGoodPartyCandidate),
	];
}

/** Small persona tag pill(s) rendered above the hero name (Figma). */
function personaTags(persona: PersonPersona): string[] {
	switch (persona) {
		case 'candidate':
			return ['Candidate'];
		case 'officeholder':
			return ['Incumbent'];
		case 'both':
			// Figma C leads with the seat held, matching the hero's office lines.
			return ['Incumbent', 'Candidate'];
		case 'past':
			return ['Former Official'];
	}
}

const CAMPAIGN_ISSUES_HEADING = 'Campaign Issues';
const IN_OFFICE_ISSUES_HEADING = 'Top Priorities While in Office';
const ACCOMPLISHMENTS_HEADING = 'Accomplishments During This Term';

const STATUS_LABELS: Record<PersonProfileIssueStatus, string> = {
	IN_PROGRESS: 'In Progress',
	PRIORITIZED: 'Prioritized',
	ONGOING: 'Ongoing',
	RESOLVED: 'Resolved',
};

// Inline "Pro Blocks / Tagline" pill from Figma: white fill, hairline gray border,
// rounded-md, subtle shadow, no icon. Used for persona tags on Recent Experience
// rows and the Other Candidates cards.
function TypeTag({ label }: { label: string }) {
	return (
		<span className='inline-flex w-fit shrink-0 items-center rounded-[6px] border border-gray-300 bg-white px-2.5 py-1 text-midnight-900 shadow-xs'>
			<Text as='span' styleType='caption'>
				{label}
			</Text>
		</span>
	);
}

// Figma "Top Issues Type Tag": a solid colour-coded chip (rounded-xs, no border)
// with uppercase 12px Outfit SemiBold text, keyed by issue/accomplishment status.
// Colour on the container, size/weight on the inner span so tailwind-merge can't
// collapse the size against the colour (see marketing-ui-clone skill).
const STATUS_TAG_STYLES: Record<PersonProfileIssueStatus, string> = {
	IN_PROGRESS: 'bg-blue-100 text-blue-900',
	PRIORITIZED: 'bg-bright-yellow-100 text-bright-yellow-900',
	ONGOING: 'bg-red-100 text-red-900',
	RESOLVED: 'bg-halo-green-100 text-halo-green-900',
};

function StatusTag({ status }: { status: PersonProfileIssueStatus }) {
	return (
		<span className={cn('inline-flex w-fit shrink-0 items-center rounded-xs px-2 py-1', STATUS_TAG_STYLES[status])}>
			<span className='font-primary text-[0.75rem] leading-4 font-semibold tracking-[1px] uppercase'>
				{STATUS_LABELS[status]}
			</span>
		</span>
	);
}

function IssuesContent({ issues, showStatus }: { issues: PersonProfileView['issues']; showStatus: boolean }): ReactNode {
	return (
		<ul className='flex flex-col gap-6'>
			{issues.map((issue) => (
				<li key={issue.id} className='flex flex-col gap-2'>
					{showStatus && issue.status && <StatusTag status={issue.status} />}
					<Text as='h4' styleType='subtitle-1'>
						{issue.title}
					</Text>
					{issue.description && <Text styleType='body-2'>{issue.description}</Text>}
				</li>
			))}
		</ul>
	);
}

function AccomplishmentsContent({ accomplishments, lead }: { accomplishments: PersonAccomplishment[]; lead: string }): ReactNode {
	return (
		<div className='flex flex-col gap-6'>
			<Text styleType='body-2'>{lead}</Text>
			<ul className='flex flex-col gap-6'>
				{accomplishments.map((item, index) => (
					<li key={`${item.title}-${index}`} className='flex flex-col gap-2'>
						<StatusTag status='RESOLVED' />
						<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
							<Text as='span' styleType='subtitle-2'>
								{item.title}
							</Text>
							{item.date && (
								<Text as='span' styleType='caption' className='text-gray-500'>
									{item.date}
								</Text>
							)}
						</div>
						{item.description && <Text styleType='body-2'>{item.description}</Text>}
					</li>
				))}
			</ul>
		</div>
	);
}

function ExperienceContent({ experience }: { experience: PersonProfileView['recentExperience'] }): ReactNode {
	return (
		<ul className='flex flex-col gap-5'>
			{experience.map((item, index) => (
				<li key={`${item.title}-${index}`} className='flex flex-col gap-4'>
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
	const rows: Array<{ icon: string; label: string; value: string }> = [];
	if (view.termLabel) rows.push({ icon: 'calendar', label: 'Term length', value: view.termLabel });
	if (electionDate) rows.push({ icon: 'vote', label: 'Next election', value: electionDate });
	return (
		<div className='flex flex-col gap-4'>
			{view.positionDescription && <Text styleType='body-2'>{view.positionDescription}</Text>}
			{rows.length > 0 && (
				<dl className='flex flex-col gap-4'>
					{rows.map(r => (
						<div key={r.label} className='flex items-start gap-3'>
							<IconResolver icon={r.icon} className='mt-0.5 h-6 w-6 shrink-0 text-midnight-900' />
							<div className='flex min-w-0 flex-col gap-0.5'>
								<Text as='dt' styleType='subtitle-2'>
									{r.label}
								</Text>
								<Text as='dd' styleType='body-2' className='text-gray-500'>
									{r.value}
								</Text>
							</div>
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
 * Person-authored sections, empowerment-gated (only shown on empowered pages).
 * Which of these actually render — and in what order — is decided solely by
 * `SECTION_ORDER` for the persona, so a candidate never picks up an in-office
 * section and vice versa.
 */
function buildAuthoredSections(view: PersonProfileView): SectionMap {
	const sections: SectionMap = {};
	const { platform, inOffice } = splitIssues(view.issues);
	if (view.whyRunning) {
		sections.why = { cardType: 'why-running', heading: whyHeading(view.persona), content: view.whyRunning };
	}
	if (platform.length > 0) {
		sections.campaignIssues = { cardType: 'top-issues', heading: CAMPAIGN_ISSUES_HEADING, content: <IssuesContent issues={platform} showStatus={false} /> };
	}
	if (inOffice.length > 0) {
		sections.inOfficePriorities = { cardType: 'top-issues', heading: IN_OFFICE_ISSUES_HEADING, content: <IssuesContent issues={inOffice} showStatus /> };
	}
	// Figma nests this under "Top Priorities While in Office" with a lead-in
	// line. The smaller heading comes from sharing that section's group, not
	// from being set here.
	if (view.accomplishments.length > 0) {
		sections.accomplishments = {
			heading: ACCOMPLISHMENTS_HEADING,
			content: (
				<AccomplishmentsContent
					accomplishments={view.accomplishments}
					lead={`${view.displayName} has accomplished the following:`}
				/>
			),
		};
	}
	if (view.bio) {
		sections.aboutMe = { cardType: 'about-me', heading: 'About Me', content: view.bio };
	}
	return sections;
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
		// A past official's frame carries this section AND the in-office one, so
		// this has to ask about the campaign; `inOfficePrompt` covers the record.
		case 'past':
			return `What did ${displayName} campaign on${office ? ` for ${office}` : ''}? Their platform and issues will appear here once they claim their profile.`;
	}
}

/** Copy for the "Top Priorities While in Office" placeholder prompt. */
function inOfficePrompt(view: PersonProfileView): string {
	const office = view.officeName ? ` in ${view.officeName}` : ' in office';
	if (view.persona === 'past') {
		return `Which priorities did ${view.displayName} focus on${office}? Their record will appear here once they claim their profile.`;
	}
	return `What is ${view.displayName} focused on${office}? Their priorities will appear here once they claim their profile.`;
}

/** Copy for the "Accomplishments During This Term" placeholder prompt. */
function accomplishmentsPrompt(view: PersonProfileView): string {
	const office = view.officeName ? ` in ${view.officeName}` : ' in office';
	const verb = view.persona === 'past' ? 'did' : 'has';
	const achieved = view.persona === 'past' ? 'achieve' : 'achieved';
	return `What ${verb} ${view.displayName} ${achieved}${office}? Their accomplishments will appear here once they claim their profile.`;
}

/** Copy for the "About Me" placeholder prompt. */
function aboutPrompt(view: PersonProfileView): string {
	const office = view.officeName ? ` for ${view.officeName}` : '';
	return `Get to know ${view.displayName}. Their background, experience, and story${office} will appear here once they claim their profile.`;
}

/** The sections a profile owner writes; the rest come from the civic spine. */
const AUTHORED_SECTIONS = new Set<SectionKey>([
	'why',
	'campaignIssues',
	'inOfficePriorities',
	'accomplishments',
	'aboutMe',
]);

/**
 * Placeholder prompt cards shown in the authored-cards slot for UNCLAIMED but
 * empowered pages (Figma states D 1917:88035, E 1917:88616, F 1917:89211,
 * H 1970:113629). The frames show a prompt for every authored section the
 * claimed page would have, so this seeds from the persona's `SECTION_ORDER`
 * rather than its own list — an unclaimed page must never advertise a
 * different set of sections than its claimed counterpart. Copy is muted
 * name + office prompt text, since there is no owner-authored content yet.
 */
function buildAuthoredPlaceholderSections(view: PersonProfileView): SectionMap {
	const prompt = (text: string) => <PlaceholderPrompt>{text}</PlaceholderPrompt>;
	const placeholders: Record<string, ProfileContentCardProps> = {
		why: { cardType: 'why-running', heading: whyHeading(view.persona), content: prompt(whyPrompt(view)) },
		campaignIssues: { cardType: 'top-issues', heading: CAMPAIGN_ISSUES_HEADING, content: prompt(issuesPrompt(view)) },
		inOfficePriorities: { cardType: 'top-issues', heading: IN_OFFICE_ISSUES_HEADING, content: prompt(inOfficePrompt(view)) },
		accomplishments: { heading: ACCOMPLISHMENTS_HEADING, content: prompt(accomplishmentsPrompt(view)) },
		aboutMe: { cardType: 'about-me', heading: 'About Me', content: prompt(aboutPrompt(view)) },
	};
	const sections: SectionMap = {};
	for (const key of SECTION_ORDER[view.persona]) {
		const card = AUTHORED_SECTIONS.has(key) ? placeholders[key] : undefined;
		if (card) sections[key] = card;
	}
	return sections;
}

/** First 4-digit year in an ISO-ish date string (avoids TZ off-by-one). */
function electionYear(electionDate: string | null): string | null {
	return electionDate?.match(/\d{4}/)?.[0] ?? null;
}

/**
 * Past-election disclaimer shown at the top of the content well for persona
 * `past` (Figma states G 1958:113149 + H 1970:113742). It reuses the Figma "CTA
 * Section Module" treatment — a light-blue (blue-100) card with centered copy and
 * a dark "Start exploring" button — and carries the frames' verbatim copy.
 */
function pastElectionDisclaimer(view: PersonProfileView): ProfileContentCardProps {
	const year = electionYear(view.electionDate);
	const ranClause = year ? `last ran for office in ${year}` : 'last ran for office';
	return {
		raw: true,
		content: (
			<div className='flex flex-col items-center gap-6 rounded-2xl bg-blue-100 px-6 py-10 text-center text-midnight-900 md:px-12'>
				<Text styleType='body-1' className='mx-auto max-w-xl'>
					{`According to our records, ${view.displayName} ${ranClause}. Please see our updated voter guide for information about upcoming elections, candidates, and current elected officials.`}
				</Text>
				<ButtonLink
					parent='PersonProfilePastElectionDisclaimer'
					href='/elections'
					styleType='secondary'
					styleSize='md'
					className='w-fit'
					iconRight={<IconResolver icon='arrow-up-right' className='h-4 w-4' />}
				>
					Start exploring
				</ButtonLink>
			</div>
		),
	};
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
 * Civics-spine sections, available on every state (data permitting). These are
 * NOT empowerment-gated, so unclaimed major-party (I/J) and removed (K/L)
 * pages still render their public-record context per the Figma removal frames.
 */
function buildCivicSections(view: PersonProfileView): SectionMap {
	const sections: SectionMap = {};
	if (view.recentExperience.length > 0) {
		sections.recentExperience = { heading: 'Recent Experience', content: <ExperienceContent experience={view.recentExperience} /> };
	}
	if (view.positionDescription || view.termLabel || view.electionDate) {
		sections.aboutPosition = {
			heading: `About ${view.officeName ?? 'the Role'}`,
			content: <AboutPositionContent view={view} />,
		};
	}
	const districtMap = buildDistrictMap(view);
	if (districtMap) {
		sections.district = { heading: 'District information', content: districtMap };
	}
	// Figma title-cases the heading and leads with the empowered (GoodParty)
	// candidate. FLAG: the frame reads "Other Candidates for [Position] in
	// <Location>" but the view has no clean locality field distinct from the
	// position name, so the "in <Location>" clause is omitted rather than invented.
	const otherCandidates = empoweredFirst(toCandidateCards(view.otherCandidates));
	if (otherCandidates.length > 0) {
		sections.otherCandidates = {
			heading: view.officeName ? `Other Candidates for ${view.officeName}` : 'Other Candidates',
			content: <OtherCandidatesContent cards={otherCandidates} />,
		};
	}
	const nearby = empoweredFirst(toCandidateCards(view.nearbyOfficials));
	if (nearby.length > 0) {
		sections.nearbyOfficials = { heading: 'Nearby Officials', content: <OtherCandidatesContent cards={nearby} /> };
	}
	return sections;
}

/**
 * Resolves the persona's section list into ordered cards, tagging each with
 * its card group. A section with no data — or one absent from the persona's
 * order — simply doesn't render.
 */
function orderedSectionCards(view: PersonProfileView, sections: SectionMap): ProfileContentCardProps[] {
	return SECTION_ORDER[view.persona].flatMap(key => {
		const card = sections[key];
		return card ? [{ ...card, group: SECTION_GROUP[key] }] : [];
	});
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

/**
 * Maps interlink cards to CandidatesBlock cards, dropping any without a link.
 *
 * The cards say nothing about GoodParty.org's relationship to the person. They
 * used to read "Empowered by GoodParty.org", the same claim-keyed line the hero
 * carried until marketing replaced it with the three pledge lines (2026-08-17,
 * approved by Emily and Jack — see `pledgeAttribution`); the line was rewritten
 * on the hero and missed here, on the same page, about other named people.
 *
 * They carry none of the three replacements instead of one of them, because
 * `RelatedPersonCard` has no pledge flag: neither `buildOtherCandidateCards` nor
 * `buildNearbyOfficialCards` reads one, so the card cannot tell "has not taken
 * it" from "we did not look". The mark and the yellow frame stay — those follow
 * `isGoodPartyCandidate` and are branding, not an assertion (Figma draws the
 * badge on these cards, and `empoweredFirst` still sorts by it).
 */
function toCandidateCards(cards: RelatedPersonCard[]): CandidateCard[] {
	return cards
		.filter(c => Boolean(c.href))
		.map(c => ({
			_key: c.personId ?? c.name,
			name: c.name,
			partyAffiliation: c.subtitle ?? '',
			href: c.href!,
			isGoodPartyCandidate: c.isEmpowered,
			attribution: 'none' as const,
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
 * The most specific place this profile sits in — city, else county, else state.
 *
 * Figma's voter-facing claim card for someone in office opens "[Location]
 * deserves greater transparency" (E 1928:99467, F 1928:100987). The view carries
 * no locality field (`districtLabel` is a ward/seat, `stateLabel` a two-letter
 * code), so this reads the place crumbs off the breadcrumb, which is built from
 * the canonical elections path `/elections/<state>/<county?>/<city?>/position/…`
 * and is already humanised. The position crumb and the trailing name crumb are
 * not places, hence the href filter. Null when the profile resolved to no place
 * at all (no race and no state).
 *
 * Someone who only holds office has no candidacy, so today they have no race
 * slug and their trail stops at the state — the same gap that leaves
 * `positionHref` null for them (see `composePersonProfileView`). They therefore
 * get "Wyoming deserves greater transparency" where the frame shows the town.
 * That is deliberately preferred to a vaguer stand-in: it is still the place
 * they serve, it is the same place the rest of their page links to, and it
 * sharpens on its own once election-api threads the office's race slug through.
 */
function profileLocationLabel(view: PersonProfileView): string | null {
	const places = view.breadcrumb.filter(
		crumb => crumb.href?.startsWith('/elections/') && !crumb.href.includes('/position/'),
	);
	return places.at(-1)?.label ?? null;
}

/**
 * Which pledge statement the hero makes about this person.
 *
 * Marketing specified these three lines keyed off CLAIM status ("has taken" for
 * claimed, "has not" for unclaimed). Claiming and pledging are separate facts
 * here: `pledged` is the ETL-maintained spine flag `Person.isPledged`, rolled up
 * from candidacies, and nothing in the claim path writes it. A claimed
 * officeholder cannot carry it at all — they have no candidacy for it to roll up
 * from, which is why state B in the shared matrix is `claimed` and `pledged:
 * false` — and a pledged candidate whose page nobody has claimed carries it
 * while reading as unclaimed. Keying the sentence to the claim would therefore
 * publish "Has Taken the GoodParty.org Pledge" about named people who have not,
 * so each line is keyed to the fact it asserts instead.
 *
 * Party wins over the pledge flag: a Democrat or Republican is not eligible to
 * take the pledge, so their status is ineligibility rather than a choice, and a
 * stale `isPledged` from a past run under another party must not override that.
 *
 * Removal (K/L) says nothing at all. `pledged` is force-cleared for removed
 * profiles, so "Has Not Taken…" there would be a line we know may be false,
 * asserted about the one group who asked us to stop publishing them.
 */
function pledgeAttribution(view: PersonProfileView): 'pledged' | 'notPledged' | 'pledgeIneligible' | 'none' {
	if (view.removed) return 'none';
	if (view.majorParty) return 'pledgeIneligible';
	return view.pledged ? 'pledged' : 'notPledged';
}

/**
 * Maps a resolved PersonProfileView onto the `personProfile` template's section
 * overrides (keyed by section `_type`/`_key`). Per-state gating (empowerment,
 * removal, claim/pledge/CTA visibility) is expressed by suppressing sections —
 * so the same behaviour holds regardless of the (editor-authored) template.
 */
export function buildPersonSectionOverrides(view: PersonProfileView): SectionOverrides {
	// Past-election profiles (G claimed, H unclaimed) lead with the past-election
	// disclaimer, NOT the claim CTA — so exclude persona 'past' from the claim gate.
	//
	// `unpublished` is excluded too: the profile is already claimed, it just isn't
	// live, so "Are you …? Claim your profile" addresses someone who owns it and
	// the voter-facing prompt asks the reader to nudge a person who already
	// decided. This is the only difference from the equivalent `absent` page.
	//
	// 'officeholder' is excluded too (marketing, 2026-08-17): someone who only
	// holds office has no self-serve product to be sent to, so their claim
	// prompts asked for an email that sales then had to action by hand. Note this
	// is the officeholder persona ONLY — 'both' (serving AND running) keeps the
	// candidate treatment, because they have a live candidacy and Win to claim
	// into. State E therefore loses its claim surfaces entirely; D/F keep theirs.
	const showClaim =
		view.empowered &&
		!view.claimed &&
		!view.unpublished &&
		view.persona !== 'past' &&
		view.persona !== 'officeholder';
	// The pledge explainer is claimed content across every persona (Figma A/B/C/G
	// all show it once claimed). Unclaimed empowered pages lead with the claim
	// prompt instead, so it stays hidden there.
	const showPledge = view.claimed;

	// The person-profile CTA band sits below the content well (Figma order):
	//  - claimed (A/B/C/G)   → generic centered "Join the movement" sign-up CTA
	//  - unclaimed empowered candidates (D/F) → full-width claim CTA band
	//    ("Are you …? Complete your profile now." + a button into Win sign-up)
	//  - officeholder-only (E), past (H), major-party (I/J), removed (K/L) → none
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
				// Deliberately NOT `contentColumnAlign`. That prop mirrors the sidebar
				// grid so the CTA lines up with the content-card column, but the frames
				// don't do that: in A (1901:50309) the CTA is a stock CTA Block whose
				// content frame sits at x=208 w=1024 in a 1440 frame — 208px either
				// side, centered on the page. Mirroring the column pushed it right of
				// center, which is the misalignment marketing reported.
			}
		: showClaim
			? { render: <PersonClaimCTABand displayName={view.displayName} /> }
			: { hidden: true };

	// The Figma content well is one column of cards. For unclaimed empowered pages
	// exactly ONE card leads the column (frames D 1958:108619 / E 1928:99467): the
	// visitor-facing "ask them to complete their profile" prompt, whose button
	// opens the notify dialog. The frames put no owner-facing claim prompt up
	// here — the person's own way in is the claim band below the well — so do not
	// add a second card.
	// Below it: authored cards (empowerment-gated) then the civics-spine cards
	// (Recent Experience → Other candidates → Nearby officials → About position →
	// District map) that render on every state.
	const claimCard = (): ProfileContentCardProps => ({
		raw: true,
		content: (
			<ClaimProfileModal
				personId={view.personId}
				displayName={view.displayName}
				persona={view.persona}
				locationLabel={profileLocationLabel(view)}
			/>
		),
	});
	// Authored slot: claimed pages show real owner content; unclaimed but
	// empowered pages (Figma D/E/F/H) show muted placeholder prompt cards in the
	// same slot; major-party (I/J) and removed (K/L) pages show neither.
	// Unpublished pages are excluded as well — every placeholder ends in "once
	// they claim their profile", so leaving them in would restate the claim
	// prompt the block above just suppressed.
	const authoredSections = view.claimed
		? buildAuthoredSections(view)
		: view.empowered && !view.unpublished
			? buildAuthoredPlaceholderSections(view)
			: {};
	const contentCards: ProfileContentCardProps[] = [
		...(view.persona === 'past' ? [pastElectionDisclaimer(view)] : []),
		...(showClaim ? [claimCard()] : []),
		...orderedSectionCards(view, { ...authoredSections, ...buildCivicSections(view) }),
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
			// The full positionName (incl. locality) links to the office/position page.
			// When a second line is present (serving AND running, Figma C) the first
			// line is the seat HELD, so the candidacy-derived href belongs on the
			// second line; the held seat gets its own href once election-api threads
			// the office's position slug through.
			officeHref: (view.secondaryRoleTitle ? undefined : view.positionHref) ?? undefined,
			secondaryOffice: view.secondaryRoleTitle ?? undefined,
			secondaryOfficeHref: (view.secondaryRoleTitle ? view.positionHref : undefined) ?? undefined,
			profileImageUrl: view.avatarUrl ?? undefined,
			isEmpowered: view.empowered,
			tags: personaTags(view.persona),
			// The line states the person's pledge status (see `pledgeAttribution`).
			// The GoodParty mark stays on CLAIMED, which is what it has always meant
			// here — it marks the page as a GoodParty.org profile rather than making
			// a claim about the pledge, and moving it onto `pledged` would strip it
			// from every claimed officeholder.
			attribution: pledgeAttribution(view),
			showBrandMark: view.claimed,
		},
		component_claimProfileBlock: {
			// The standalone full-width claim banner is always suppressed now: the
			// claim prompt renders in-column as light-blue cards inside the content
			// well (see `claimCard` above), matching the Figma layout.
			//
			// It also cannot go here: the hero portrait deliberately overflows 104px
			// (md) / 216px (lg) below the hero box, and the next section is expected
			// to offset for it the way ProfileContentBlock's sidebar does. A
			// full-width banner in this slot renders its headline underneath the
			// photo.
			claimed: true,
		},
		component_profileContentBlock: {
			contentCards,
			sidebar,
			// Figma people profiles group sections into separate white cards with
			// cream gaps (not one joined box like /candidate).
			cardLayout: 'separated',
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
						copy: ELECTIONS_INDEX_COPY[view.electionsIndex.entryLevel],
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
