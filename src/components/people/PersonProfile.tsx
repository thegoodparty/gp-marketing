import type { ReactNode } from 'react';

import type { PersonProfileView, PersonPersona } from '~/lib/peopleProfile';
import type { PersonAccomplishment } from '~/types/people';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { CTABannerBlock } from '~/ui/CTABannerBlock';
import { GoodPartyOrgPledge, type PledgeCard } from '~/ui/GoodPartyOrgPledge';
import { IconResolver } from '~/ui/IconResolver';
import { ProfileContentBlock } from '~/ui/ProfileContentBlock';
import type { ProfileContentCardProps } from '~/ui/ProfileContentCard';
import { ProfileHero } from '~/ui/ProfileHero';
import type { ElectionsSidebarProps } from '~/ui/ElectionsSidebar';
import { Text } from '~/ui/Text';
import { ClaimProfileModal } from './ClaimProfileModal';

const PLEDGE_CARDS: PledgeCard[] = [
	{
		icon: 'heart',
		title: 'Independent',
		content:
			'Candidates are running outside the two-party system as an Independent, nonpartisan, or third-party candidate.',
	},
	{
		icon: 'users',
		title: 'People-Powered',
		content:
			'Candidates take the majority of their funds from grassroots donors and reject the influence of special interests and big money.',
	},
	{
		icon: 'star',
		title: 'Anti-Corruption',
		content:
			'Candidates pledge to be accountable and transparent with their policy agendas and report attempts to unduly influence them.',
	},
	{
		icon: 'hand-heart',
		title: 'Civility',
		content:
			"Candidates pledge to run a clean campaign free of mudslinging and uphold a minimum standard of civility in their campaign's conduct.",
	},
];

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

function TransparencyPill({ label }: { label: string }) {
	return (
		<span className='inline-flex w-fit items-center gap-1.5 rounded-full bg-halo-green-100 px-3 py-1 text-midnight-900'>
			<IconResolver icon='badge-check' className='h-3.5 w-3.5' />
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
					{issue.transparency && (
						<div className='pl-7'>
							<TransparencyPill label={issue.transparency} />
						</div>
					)}
				</li>
			))}
		</ol>
	);
}

function AccomplishmentsContent({
	accomplishments,
}: {
	accomplishments: PersonAccomplishment[];
}): ReactNode {
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

function buildContentCards(view: PersonProfileView): ProfileContentCardProps[] {
	const cards: ProfileContentCardProps[] = [];

	if (view.bio) {
		cards.push({ cardType: 'about-me', heading: 'About', content: view.bio });
	}
	if (view.whyRunning) {
		cards.push({
			cardType: 'why-running',
			heading: whyHeading(view.persona),
			content: view.whyRunning,
		});
	}
	if (view.issues.length > 0) {
		cards.push({
			cardType: 'top-issues',
			heading: issuesHeading(view.persona),
			content: <IssuesContent issues={view.issues} />,
		});
	}
	if (view.accomplishments.length > 0) {
		cards.push({
			heading: 'Accomplishments',
			content: <AccomplishmentsContent accomplishments={view.accomplishments} />,
		});
	}
	return cards;
}

function buildSidebar(view: PersonProfileView): ElectionsSidebarProps | undefined {
	const links = view.links.map((link) => ({ label: link.label, icon: link.icon, href: link.href }));
	const location = [view.districtLabel, view.stateLabel].filter(Boolean).join(', ');
	const aboutOffice = [view.officeName, location].filter(Boolean).join(' · ') || undefined;

	if (links.length === 0 && !aboutOffice && !view.termLabel) return undefined;

	return {
		links: links.length > 0 ? links : undefined,
		aboutOffice,
		termLength: view.termLabel ?? undefined,
	};
}

export function PersonProfile({ view }: { view: PersonProfileView }) {
	const showPledge = view.persona === 'candidate' || view.persona === 'both';
	const contentCards = buildContentCards(view);
	const sidebar = buildSidebar(view);

	return (
		<article data-component='PersonProfilePage'>
			<BreadcrumbBlock
				backgroundColor='midnight'
				breadcrumbs={[
					{ href: '/', label: 'Home' },
					{ href: '/people', label: 'People' },
					{ label: view.displayName },
				]}
			/>

			<ProfileHero
				backgroundColor='midnight'
				candidateName={view.displayName}
				office={view.roleTitle ?? ''}
				profileImageUrl={view.avatarUrl ?? undefined}
				isEmpowered={view.claimed}
			/>

			{!view.claimed && (
				<ClaimProfileModal
					personId={view.personId}
					displayName={view.displayName}
					persona={view.persona}
				/>
			)}

			{(contentCards.length > 0 || sidebar) && (
				<ProfileContentBlock backgroundColor='cream' sidebar={sidebar} contentCards={contentCards} />
			)}

			{showPledge && (
				<GoodPartyOrgPledge
					backgroundColor='midnight'
					iconBg='mixed'
					header={{
						title: 'The GoodParty.org Pledge',
						copy: 'All GoodParty.org candidates agree to the following:',
					}}
					pledgeCards={PLEDGE_CARDS}
				/>
			)}

			<CTABannerBlock
				backgroundColor='cream'
				color='halo-green'
				title='Build a better democracy with us.'
				copy='Support independent candidates, run for office, or join our community of people working to fix our broken political system.'
				button={{ buttonType: 'signup', label: 'Get started' }}
			/>
		</article>
	);
}
