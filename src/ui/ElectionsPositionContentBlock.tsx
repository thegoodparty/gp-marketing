import { Fragment, type ReactNode } from 'react';

import type { PositionHeroState } from '~/lib/positionHeroState';
import { cn, tv } from './_lib/utils.ts';
import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { Text } from './Text.tsx';
import type { SanityImage } from './types.ts';
import {
	ElectionsPositionPeopleLists,
	type ElectionsPositionPerson,
	type ElectionsPositionPledgeExplainer,
	type ElectionsPositionSeatFilter,
} from './ElectionsPositionPeopleLists.tsx';

export type { ElectionsPositionPerson, ElectionsPositionPledgeExplainer, ElectionsPositionSeatFilter };

const styles = tv({
	slots: {
		base: 'py-16 text-midnight-900',
		// 308 rail + 44 gap + 848 column = the 1200 the xl container gives at 1440.
		layout: 'flex flex-col gap-8 lg:grid lg:grid-cols-[19.25rem_minmax(0,1fr)] lg:items-start lg:gap-x-11',
		// The rail is desktop-only: the phone frame carries none of it.
		rail: 'flex flex-col gap-8 max-lg:hidden lg:sticky lg:top-8',
		railCard: 'flex flex-col gap-4 rounded-2xl p-8',
		railNav: 'bg-white',
		railExplore: 'bg-bright-yellow-100',
		railTitle: 'text-midnight-900',
		navList: 'flex flex-col gap-1',
		navLink: 'flex items-center gap-2 py-1 font-secondary underline decoration-from-font underline-offset-2 hover:text-goodparty-blue',
		navDot: 'size-1 shrink-0 rounded-full bg-midnight-900',
		column: 'flex min-w-0 flex-col gap-10',
		section: 'flex flex-col gap-4',
		// Figma draws these 32px at every width; heading-sm ramps 24 → 32 and heading-md 32 → 40, so pair them.
		sectionHeading: 'text-midnight-900 max-md:text-heading-md',
		card: 'relative overflow-hidden rounded-3xl bg-white p-6 md:p-10',
		// Figma: three columns divided by hairlines from md; stacked and centred with a
		// hairline between them on the phone, 24px clear on each side of it.
		voterGrid: 'grid grid-cols-1 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0',
		voterItem:
			'flex flex-col items-center gap-2 py-6 text-center first:pt-0 last:pb-0 md:items-start md:gap-6 md:px-4 md:py-0 md:text-left md:first:pl-0 md:last:pr-0',
		// Figma: 112px on the phone, 64px on desktop.
		voterImage: 'relative size-28 shrink-0 md:size-16',
		voterLink: 'mt-auto flex w-fit items-center gap-2 py-2.5 font-secondary text-info-500 hover:underline',
		attributes: 'grid gap-6 sm:grid-cols-2 md:grid-cols-3',
		attribute: 'flex flex-col gap-2',
		// Figma: 16px box with a 4px radius, 8px from an 18/28 label, in a 44px row.
		typeList: 'flex flex-col divide-y divide-neutral-300 overflow-hidden rounded-md border border-neutral-200',
		typeRow: 'flex items-start gap-2 px-3 py-2',
		typeLabel: 'leading-7',
		checkbox: 'mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
		steps: 'flex flex-col gap-8',
		step: 'flex flex-col gap-4 border-t border-neutral-200 pt-8 first:border-t-0 first:pt-0 md:flex-row md:items-start',
		stepIcon: 'flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-200 text-midnight-900',
		stepBody: 'flex min-w-0 flex-1 flex-col gap-3.5',
		stepAttributes: 'grid gap-6 sm:grid-cols-2',
		banner: 'rounded-lg border border-neutral-300 bg-white px-4 py-1.5 font-secondary shadow-xs',
		needHelp: 'border-t border-dashed border-neutral-300 pt-3.5',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream' },
			midnight: { base: 'bg-midnight-900 text-white', sectionHeading: 'text-white' },
		},
	},
});

export type ElectionsPositionAttribute = { label: string; value: string };

export type ElectionsPositionElectionType = { label: string; checked: boolean };

export type ElectionsPositionHowToRunStep = {
	/** "Step 1" and so on; omitted when the step stands alone. */
	number?: string;
	title: string;
	icon: string;
	body?: ReactNode;
	attributes?: ElectionsPositionAttribute[];
	button?: ComponentButtonProps;
};

export type ElectionsPositionVoterItem = {
	key?: string;
	/** Uploaded in Studio; the default items carry none. */
	image?: SanityImage;
	imageAlt?: string;
	title?: string;
	copy?: ReactNode;
	button?: ComponentButtonProps;
};

export type ElectionsPositionContentBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	/** Shared with the hero so the two blocks can never disagree about the phase. */
	state: PositionHeroState;
	/** Used for the accessible names. */
	officeName: string;
	siderail: {
		onThisPageTitle: string;
		/** Hidden when the page has no location to link to. */
		explore?: { title: string; body: ReactNode; buttonLabel: string; href: string };
	};
	/** Shown at the top of each people list, because it explains the mark on those rows. */
	pledgeExplainer?: ElectionsPositionPledgeExplainer;
	/** `undefined` or empty hides the list and its "On this page" link. */
	candidates?: ElectionsPositionPerson[];
	officeholders?: ElectionsPositionPerson[];
	seatFilter?: ElectionsPositionSeatFilter;
	headings: {
		candidates: string;
		candidatesIntro?: string;
		results: string;
		officeholders: string;
		officeholdersIntro?: string;
		showMore: string;
		voter: string;
		voterSubtitle?: string;
		about: string;
		howToRun: string;
	};
	voterReadiness?: { items: ElectionsPositionVoterItem[] };
	/** Hidden when the race carries neither a description nor an attribute. */
	about?: {
		cardTitle: string;
		description?: string;
		attributes: ElectionsPositionAttribute[];
		electionTypesLabel: string;
		electionTypes?: ElectionsPositionElectionType[];
	};
	howToRun?: {
		/** Shown above the steps once the race is decided. */
		electionOverBanner?: string;
		steps: ElectionsPositionHowToRunStep[];
		needHelp?: ReactNode;
	};
};

// The md button is a fixed 40px tall, which pins a wrapped label against its
// edges. Labels here carry place names ("See all Harris County races") and
// live in a 244px rail, so they wrap; let the pill grow and keep its padding.
const WRAPPING_BUTTON = 'h-auto min-h-10 leading-5 text-left';

export const POSITION_CONTENT_IDS = {
	candidates: 'position-candidates',
	officeholders: 'position-officeholders',
	voter: 'position-vote',
	about: 'position-about',
	howToRun: 'position-how-to-run',
} as const;

/**
 * Before the filing window opens there is nobody on the ballot yet, so the
 * page leads with what the office is and how to run for it (Emily, 2026-10-06;
 * Figma 2360:19703 and 2360:19298). Every other phase leads with the people.
 */
export function leadsWithAbout(state: PositionHeroState): boolean {
	return state.phase === 'filing' && !state.filingOpen;
}

function Attribute({ label, value }: ElectionsPositionAttribute) {
	const s = styles();
	return (
		<div className={s.attribute()}>
			<Text as='dt' styleType='overline'>
				{label}
			</Text>
			<Text as='dd' styleType='body-1'>
				{value}
			</Text>
		</div>
	);
}

// IconResolver's md size pins a 24px minimum, which would make a 40px pill 44px tall.
function ArrowUpRight() {
	return <IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />;
}

export function ElectionsPositionContentBlock(props: ElectionsPositionContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const s = styles({ backgroundColor });
	const decided = props.state.phase === 'decided';
	const aboutFirst = leadsWithAbout(props.state);

	const hasCandidates = (props.candidates?.length ?? 0) > 0;
	const hasOfficeholders = (props.officeholders?.length ?? 0) > 0;
	const hasAbout = props.about !== undefined && (Boolean(props.about.description) || props.about.attributes.length > 0);
	const hasHowToRun = props.howToRun !== undefined && props.howToRun.steps.length > 0;
	const hasVoter = (props.voterReadiness?.items.length ?? 0) > 0;

	const peopleLinks = [
		hasCandidates
			? { href: `#${POSITION_CONTENT_IDS.candidates}`, label: decided ? props.headings.results : props.headings.candidates }
			: null,
		hasOfficeholders ? { href: `#${POSITION_CONTENT_IDS.officeholders}`, label: props.headings.officeholders } : null,
	];
	const voterLink = hasVoter ? { href: `#${POSITION_CONTENT_IDS.voter}`, label: props.headings.voter } : null;
	const aboutLink = hasAbout ? { href: `#${POSITION_CONTENT_IDS.about}`, label: props.headings.about } : null;
	const howToRunLink = hasHowToRun ? { href: `#${POSITION_CONTENT_IDS.howToRun}`, label: props.headings.howToRun } : null;
	const navLinks = (
		aboutFirst ? [aboutLink, howToRunLink, ...peopleLinks, voterLink] : [...peopleLinks, voterLink, aboutLink, howToRunLink]
	).filter((link): link is { href: string; label: string } => link !== null);

	const people = (
		<ElectionsPositionPeopleLists
			candidates={props.candidates}
			officeholders={props.officeholders}
			seatFilter={props.seatFilter}
			candidatesHeading={decided ? props.headings.results : props.headings.candidates}
			candidatesIntro={props.headings.candidatesIntro}
			officeholdersHeading={props.headings.officeholders}
			officeholdersIntro={props.headings.officeholdersIntro}
			explainer={props.pledgeExplainer}
			showMoreLabel={props.headings.showMore}
			decided={decided}
			candidatesId={POSITION_CONTENT_IDS.candidates}
			officeholdersId={POSITION_CONTENT_IDS.officeholders}
		/>
	);

	const voter = hasVoter && props.voterReadiness && (
		<section id={POSITION_CONTENT_IDS.voter} className={s.section()} data-testid='position-voter-readiness'>
			<div className='flex flex-col gap-1'>
				<Text as='h2' styleType='heading-sm' className={s.sectionHeading()}>
					{props.headings.voter}
				</Text>
				{props.headings.voterSubtitle && <Text styleType='body-1'>{props.headings.voterSubtitle}</Text>}
			</div>
			<div className={cn(s.card(), 'text-midnight-900')}>
				<div className={s.voterGrid()}>
					{props.voterReadiness.items.map((item, index) => (
						<div key={item.key ?? index} className={s.voterItem()}>
							{item.image && (
								<div className={s.voterImage()}>
									<ResponsiveImage image={item.image} alt={item.imageAlt ?? ''} objectFit='contain' maxWidth={224} aspectRatio='1' />
								</div>
							)}
							<div className='flex flex-col gap-2'>
								{item.title && (
									<Text as='h3' styleType='subtitle-1'>
										{item.title}
									</Text>
								)}
								{item.copy && (
									<Text as='div' styleType='body-2' className='text-neutral-600'>
										{item.copy}
									</Text>
								)}
							</div>
							{item.button && 'href' in item.button && (
								<Anchor href={item.button.href} className={s.voterLink()}>
									<Text as='span' styleType='text-md' className='font-semibold'>
										{item.button.label}
									</Text>
									<ArrowUpRight />
								</Anchor>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);

	const about = hasAbout && props.about && (
		<section id={POSITION_CONTENT_IDS.about} className={s.section()} data-testid='position-about'>
			<Text as='h2' styleType='heading-sm' className={s.sectionHeading()}>
				{props.headings.about}
			</Text>
			<div className={cn(s.card(), 'flex flex-col gap-6 text-midnight-900')}>
				<div className='flex flex-col gap-2'>
					<Text as='h3' styleType='subtitle-1'>
						{props.about.cardTitle}
					</Text>
					{props.about.description && <Text styleType='body-1'>{props.about.description}</Text>}
				</div>
				{props.about.attributes.length > 0 && (
					<dl className={s.attributes()}>
						{props.about.attributes.map(attribute => (
							<Attribute key={attribute.label} {...attribute} />
						))}
					</dl>
				)}
				{props.about.electionTypes && props.about.electionTypes.length > 0 && (
					<div className='flex flex-col gap-2'>
						<Text as='h4' styleType='overline'>
							{props.about.electionTypesLabel}
						</Text>
						<ul className={s.typeList()}>
							{props.about.electionTypes.map(type => (
								<li key={type.label} className={s.typeRow()}>
									<span
										className={cn(
											s.checkbox(),
											type.checked ? 'border-goodparty-blue bg-goodparty-blue text-white' : 'border-neutral-300 bg-white',
										)}
										role='img'
										aria-label={type.checked ? 'Yes' : 'No'}
									>
										{type.checked && <IconResolver icon='check' className='size-3' strokeWidth={3} />}
									</span>
									<Text as='span' styleType='body-2' className={s.typeLabel()}>
										{type.label}
									</Text>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</section>
	);

	const howToRun = hasHowToRun && props.howToRun && (
		<section id={POSITION_CONTENT_IDS.howToRun} className={s.section()} data-testid='position-how-to-run'>
			<Text as='h2' styleType='heading-sm' className={s.sectionHeading()}>
				{props.headings.howToRun}
			</Text>
			<div className={cn(s.card(), 'flex flex-col gap-6 text-midnight-900')}>
				{decided && props.howToRun.electionOverBanner && (
					<Text as='p' styleType='text-md' className={s.banner()} data-testid='position-election-over'>
						{props.howToRun.electionOverBanner}
					</Text>
				)}
				<ol className={s.steps()}>
					{props.howToRun.steps.map((step, index) => (
						<li key={step.number ?? index} className={s.step()}>
							<div className={s.stepIcon()}>
								<IconResolver icon={step.icon} className='size-6' />
							</div>
							<div className={s.stepBody()}>
								<div className='flex flex-col gap-2'>
									{step.number && (
										<Text as='span' styleType='text-md' className='font-primary font-semibold'>
											{step.number}
										</Text>
									)}
									<Text as='h3' styleType='subtitle-1'>
										{step.title}
									</Text>
									{step.body && (
										<Text as='div' styleType='body-1'>
											{step.body}
										</Text>
									)}
								</div>
								{step.attributes && step.attributes.length > 0 && (
									<dl className={s.stepAttributes()}>
										{step.attributes.map(attribute => (
											<Attribute key={attribute.label} {...attribute} />
										))}
									</dl>
								)}
								{step.button && (
									<ComponentButton
										{...step.button}
										iconRight={step.button.iconRight ?? <ArrowUpRight />}
										className={cn(WRAPPING_BUTTON, 'w-fit max-md:w-full')}
										buttonProps={{ ...(step.button.buttonProps ?? {}), styleType: 'secondary', styleSize: 'md' }}
									/>
								)}
							</div>
						</li>
					))}
				</ol>
				{props.howToRun.needHelp && (
					<Text as='div' styleType='body-1' className={s.needHelp()}>
						{props.howToRun.needHelp}
					</Text>
				)}
			</div>
		</section>
	);

	const ordered: [string, ReactNode][] = aboutFirst
		? [
				['about', about],
				['howToRun', howToRun],
				['people', people],
				['voter', voter],
			]
		: [
				['people', people],
				['voter', voter],
				['about', about],
				['howToRun', howToRun],
			];

	return (
		<article
			className={cn(s.base(), props.className)}
			data-component='ElectionsPositionContentBlock'
			data-phase={props.state.phase}
			data-layout={aboutFirst ? 'about-first' : 'people-first'}
		>
			<Container size='xl'>
				<div className={s.layout()}>
					<aside className={s.rail()} aria-label='Page navigation'>
						{navLinks.length > 0 && (
							<nav className={cn(s.railCard(), s.railNav())} data-testid='position-on-this-page'>
								<Text as='h2' styleType='subtitle-1' className={s.railTitle()}>
									{props.siderail.onThisPageTitle}
								</Text>
								<ul className={s.navList()}>
									{navLinks.map(link => (
										<li key={link.href}>
											<a href={link.href} className={s.navLink()}>
												<span className={s.navDot()} aria-hidden />
												<Text as='span' styleType='text-md'>
													{link.label}
												</Text>
											</a>
										</li>
									))}
								</ul>
							</nav>
						)}
						{props.siderail.explore && (
							<div className={cn(s.railCard(), s.railExplore())} data-testid='position-explore-card'>
								<Text as='h2' styleType='subtitle-1' className={s.railTitle()}>
									{props.siderail.explore.title}
								</Text>
								<Text as='div' styleType='text-md' className='font-secondary text-midnight-900'>
									{props.siderail.explore.body}
								</Text>
								<ComponentButton
									buttonType='internal'
									href={props.siderail.explore.href}
									label={props.siderail.explore.buttonLabel}
									iconRight={<ArrowUpRight />}
									className={cn(WRAPPING_BUTTON, 'w-fit')}
									buttonProps={{ styleType: 'secondary', styleSize: 'md' }}
								/>
							</div>
						)}
					</aside>

					<div className={s.column()}>
						{ordered.map(([key, node]) => (
							<Fragment key={key}>{node}</Fragment>
						))}
					</div>
				</div>
			</Container>
		</article>
	);
}
