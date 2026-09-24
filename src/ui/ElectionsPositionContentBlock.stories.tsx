import type { Meta, StoryObj } from '@storybook/react';
import {
	ElectionsPositionContentBlock,
	type ElectionsPositionContentBlockProps,
	type ElectionsPositionPerson,
} from './ElectionsPositionContentBlock.tsx';

const candidates: ElectionsPositionPerson[] = [
	{
		key: '1',
		name: 'Tom Nguyen',
		party: 'Independent',
		isPledged: true,
		href: '/people/tom-nguyen-1',
		avatar: 'https://i.pravatar.cc/128?img=12',
		isWinner: true,
	},
	{
		key: '2',
		name: 'Maria Hernandez',
		party: 'Independent',
		isPledged: true,
		href: '/people/maria-hernandez-2',
		avatar: 'https://i.pravatar.cc/128?img=32',
	},
	{ key: '3', name: 'Aisha Okonkwo', party: 'Democratic party', href: '/people/aisha-okonkwo-3' },
	{ key: '4', name: 'James Whitfield', party: 'Republican party', href: '/people/james-whitfield-4' },
	{ key: '5', name: 'Priya Raman', party: 'Libertarian party', href: '/people/priya-raman-5' },
	{ key: '6', name: 'Daniel Okafor', party: 'Democratic party', href: '/people/daniel-okafor-6' },
];

const officeholders: ElectionsPositionPerson[] = [
	{
		key: 'o1',
		name: 'Grace Hopper',
		party: 'Independent',
		isPledged: true,
		term: '2023 to 2027',
		seatLabel: 'Seat 2',
		seatValue: '2',
		href: '/people/grace-hopper-o1',
		avatar: 'https://i.pravatar.cc/128?img=47',
	},
	{
		key: 'o2',
		name: 'Carlos Mendes',
		party: 'Democratic',
		term: '2025 to 2029',
		seatLabel: 'Seat 1',
		seatValue: '1',
		href: '/people/carlos-mendes-o2',
	},
];

const howToRun: NonNullable<ElectionsPositionContentBlockProps['howToRun']> = {
	electionOverBanner:
		"This election is over. Filing for the next City Council Member election opens after results are certified. Here's how the process works so you're ready.",
	steps: [
		{
			number: 'Step 1',
			icon: 'user-round',
			title: 'Meet eligibility requirements',
			body: <p>Must be a registered voter, at least 18 years old, and a resident of the district for one year before the election.</p>,
		},
		{
			number: 'Step 2',
			icon: 'file-text',
			title: 'File for office',
			attributes: [
				{ label: 'Filing requirements', value: 'Application for a place on the ballot and a $500 fee or 25 petition signatures' },
				{ label: 'Filing period', value: 'June 1, 2026 - October 2, 2026' },
				{ label: 'Paperwork instructions', value: 'Submit in person or by mail to the Office of the City Clerk' },
				{ label: 'Where to file', value: 'Office of the City Clerk, 301 W 2nd St, Austin, TX 78701' },
			],
		},
		{
			number: 'Step 3',
			icon: 'trending-up',
			title: 'Launch your campaign',
			body: (
				<p>
					A real campaign starts with a real plan. Get a custom campaign plan from GoodParty.org, personalized for your race and district.
				</p>
			),
			button: { buttonType: 'internal', href: '/run-for-office', label: 'Get started' },
		},
	],
	needHelp: (
		<p>
			<strong>Need help?</strong> You don&apos;t have to run alone. Join the{' '}
			<a href='https://community.goodparty.org' className='text-goodparty-blue underline'>
				GoodParty.org Community
			</a>{' '}
			to get advice from real independents who have run and won.
		</p>
	),
};

const base: ElectionsPositionContentBlockProps = {
	backgroundColor: 'cream',
	state: { phase: 'filing', filingOpen: true },
	officeName: 'City Council Member',
	siderail: {
		onThisPageTitle: 'On this page',
		explore: {
			title: 'Explore more races in Austin',
			body: <p>Browse every upcoming election in Austin and find independent candidates who&apos;ve taken the GoodParty.org Pledge.</p>,
			buttonLabel: 'See all Austin races',
			href: '/elections/tx/travis-county/austin',
		},
		share: {
			title: 'Know someone who should run for City Council Member?',
			body: (
				<p>
					Our democracy is stronger when everyday people step up. Share this page to nominate someone you trust to run for City Council
					Member.
				</p>
			),
			buttonLabel: 'Share',
			url: 'https://goodparty.org/elections/tx/travis-county/austin/position/city-council-member',
		},
	},
	badgeCallout: {
		title: 'What this badge means',
		body: (
			<p>
				Candidates with the heart and star badge pledged to run without money or endorsement from either major party. Any candidate can take
				the GoodParty.org Pledge, and those without the badge haven&apos;t yet. It&apos;s not an endorsement, but it&apos;s worth weighing
				when you fill out your ballot.
			</p>
		),
	},
	candidates,
	officeholders,
	headings: {
		candidates: 'Candidates for City Council Member',
		results: 'Results for City Council Member',
		officeholders: "Who's currently in office",
		showMore: 'See more candidates',
		voter: "Are you ready for Austin's next election?",
		voterSubtitle: 'Get registered and ready to vote, whether in person or by mail.',
		about: 'About City Council Member',
		howToRun: 'How to run for City Council Member',
	},
	brandedCta: {
		headline: 'Tired of choosing between red and blue?',
		body: (
			<p>
				Candidates for City Council Member have taken the GoodParty.org Pledge to serve people, not parties or big money. See who they are
				above, or learn how you can step up to run.
			</p>
		),
		button: { buttonType: 'internal', href: '/run-for-office', label: 'Learn more' },
	},
	voterReadiness: {
		items: [
			{
				key: 'r',
				icon: 'clipboard-check',
				title: 'Check your voter registration',
				copy: <p>Check your voter registration in under a minute.</p>,
				button: { buttonType: 'external', href: 'https://vote.gov', label: 'Check my registration' },
			},
			{
				key: 'p',
				icon: 'vote',
				title: 'Find your polling location',
				copy: <p>Learn where to go to vote in person.</p>,
				button: { buttonType: 'external', href: 'https://www.vote.org/polling-place-locator/', label: 'Find my polling place' },
			},
			{
				key: 'm',
				icon: 'mail-open',
				title: 'Request a mail-in ballot',
				copy: <p>Apply for an absentee ballot to vote by mail.</p>,
				button: { buttonType: 'external', href: 'https://www.vote.org/absentee-ballot/', label: 'Request my ballot' },
			},
		],
	},
	about: {
		cardTitle: 'About this position',
		description:
			'The City Council Member sets city policy, approves the budget and oversees city departments on behalf of the residents of their district.',
		attributes: [
			{ label: 'Office level', value: 'City' },
			{ label: 'Election frequency', value: 'Every 4 years' },
			{ label: 'Typical salary', value: '$115,000 / year' },
			{ label: 'Commitment level', value: 'Full Time' },
			{ label: 'Affiliation', value: 'Nonpartisan' },
			{ label: 'Positions', value: '14 open seats' },
		],
		electionTypesLabel: 'Election type',
		electionTypes: [
			{ label: 'Partisan election (party labels appear on ballots)', checked: false },
			{ label: 'Run-off election', checked: true },
		],
	},
	howToRun,
};

const meta: Meta<typeof ElectionsPositionContentBlock> = {
	title: 'New Components/Page Sections/Elections Position Content Block',
	component: ElectionsPositionContentBlock,
	render: args => <ElectionsPositionContentBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2001-6295',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/** State 1: filing is open. Candidates listed, four shown, the rest behind "See more". */
export const Filing: Story = { args: base };

/** State 2: the filing deadline has passed. Same body as filing; only the hero changes. */
export const MidElection: Story = {
	args: { ...base, state: { phase: 'midElection', resultsPending: false } },
};

/** State 3: the race is decided and a pledged candidate won. Results heading, ELECTED tag, winner copy, "election is over" banner. */
export const DecidedPledgedWinner: Story = {
	args: {
		...base,
		state: { phase: 'decided', multipleWinners: false },
		brandedCta: {
			headline: 'A GoodParty.org candidate won this race.',
			body: <p>Proof that people-first, independent candidates win. Want to be next? The next election is already on the horizon.</p>,
			button: { buttonType: 'internal', href: '/run-for-office', label: 'Learn more' },
		},
	},
};

/** State 3 again, but nobody who won took the Pledge. */
export const DecidedNoPledgedWinner: Story = {
	args: {
		...base,
		state: { phase: 'decided', multipleWinners: false },
		candidates: candidates.map(c => ({ ...c, isPledged: false, isWinner: c.key === '3' })),
		brandedCta: {
			headline: 'Tired of choosing between red and blue?',
			body: <p>There weren&apos;t any winners this cycle who took the GoodParty.org Pledge. Learn how you can step up to run next.</p>,
			button: { buttonType: 'internal', href: '/run-for-office', label: 'Learn more' },
		},
	},
};

/** State 4: several winners. The same body as state 3; the seat count only changes the hero. */
export const DecidedMultipleWinners: Story = {
	args: {
		...DecidedPledgedWinner.args,
		state: { phase: 'decided', multipleWinners: true },
		candidates: candidates.map(c => ({ ...c, isWinner: c.key === '1' || c.key === '2' })),
	},
};

/** No candidate data: the candidates list, its nav link and the badge callout's reason to exist go with it. */
export const NoCandidateData: Story = {
	args: { ...base, candidates: undefined, officeholders: undefined },
};

/** Officeholders only, as a page looks between cycles when nobody has filed yet. */
export const OfficeholdersOnly: Story = {
	args: { ...base, candidates: [] },
};

/** With seat data on every row the filter appears and narrows both lists. */
export const WithSeatFilter: Story = {
	args: {
		...base,
		candidates: candidates.slice(0, 4).map((c, i) => ({ ...c, seatValue: String((i % 2) + 1), seatLabel: `Seat ${(i % 2) + 1}` })),
		seatFilter: {
			label: 'Filter by Seat',
			options: [
				{ value: '1', label: 'Seat 1' },
				{ value: '2', label: 'Seat 2' },
			],
		},
	},
};

/** A race election-api knows almost nothing about: no About facts, no filing details, no location to explore. */
export const SparseRaceData: Story = {
	args: {
		...base,
		candidates: undefined,
		officeholders: undefined,
		about: undefined,
		siderail: { onThisPageTitle: 'On this page', share: base.siderail.share },
		howToRun: { ...howToRun, steps: howToRun.steps.slice(2).map(step => ({ ...step, number: 'Step 1' })) },
	},
};

export const Midnight: Story = {
	args: { ...base, backgroundColor: 'midnight' },
};
