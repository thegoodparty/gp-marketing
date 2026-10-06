import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsPositionHero, type ElectionsPositionHeroCandidate, type ElectionsPositionHeroWinner } from './ElectionsPositionHero.tsx';

const NOW = new Date('2026-08-15T12:00:00');

const race = {
	officeName: 'City Council Member',
	stateName: 'Texas',
	cityName: 'Austin',
	filingDateStart: '2026-06-01T00:00:00.000Z',
	filingDateEnd: '2026-10-02T00:00:00.000Z',
	electionDate: '2026-11-03T00:00:00.000Z',
	candidatesHref: '/elections/tx/travis-county/austin/position/city-council-member/candidates',
	intro: 'A nonpartisan guide to City Council Member in Austin. Find candidates and elected officials who have turned down partisan and big-money influence.',
	now: NOW,
};

const candidates: ElectionsPositionHeroCandidate[] = [
	{ key: '1', name: 'Tom Nguyen', party: 'Independent', partyClass: 'independent', isPledged: true, href: '/people/tom-nguyen-1', isWinner: true },
	{ key: '2', name: 'Maria Hernandez', party: 'Democratic', partyClass: 'democrat', href: '/people/maria-hernandez-2' },
	{ key: '3', name: 'Aisha Okonkwo', party: 'Democratic', partyClass: 'democrat', href: '/people/aisha-okonkwo-3' },
	{ key: '4', name: 'James Whitfield', party: 'Republican', partyClass: 'republican', href: '/people/james-whitfield-4' },
];

const winner: ElectionsPositionHeroWinner = {
	key: '1',
	name: 'Tom Nguyen',
	party: 'Independent',
	term: '2027 to 2031',
	seatLabel: 'City Council Member',
	isPledged: true,
	href: '/people/tom-nguyen-1',
	avatar: 'https://i.pravatar.cc/192?img=12',
};

const meta: Meta<typeof ElectionsPositionHero> = {
	title: 'New Components/Page Sections/Elections Position Hero',
	component: ElectionsPositionHero,
	render: args => <ElectionsPositionHero {...args} />,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2156-29711',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FilingOpen: Story = {
	args: {
		...race,
		state: { phase: 'filing', filingOpen: true },
		candidates,
	},
};

export const FilingNotYetOpen: Story = {
	args: {
		...race,
		state: { phase: 'filing', filingOpen: false },
		candidates: [],
		now: new Date('2026-02-10T12:00:00'),
	},
};

export const FilingNoCandidateData: Story = {
	args: {
		...race,
		state: { phase: 'filing', filingOpen: true },
		candidates: undefined,
	},
};

export const MidElection: Story = {
	args: {
		...race,
		state: { phase: 'midElection', resultsPending: false },
		candidates,
		now: new Date('2026-10-20T12:00:00'),
	},
};

export const ResultsPending: Story = {
	args: {
		...race,
		state: { phase: 'midElection', resultsPending: true },
		candidates,
		now: new Date('2026-11-10T12:00:00'),
	},
};

export const Decided: Story = {
	args: {
		...race,
		state: { phase: 'decided', multipleWinners: false },
		candidates,
		winners: [winner],
		now: new Date('2026-12-01T12:00:00'),
	},
};

export const DecidedMultipleWinners: Story = {
	args: {
		...race,
		state: { phase: 'decided', multipleWinners: true },
		candidates: candidates.map(c => ({ ...c, isWinner: true })),
		winners: [
			winner,
			{ key: '2', name: 'Maria Hernandez', party: 'Democratic', avatar: 'https://i.pravatar.cc/96?img=32' },
			{ key: '3', name: 'Aisha Okonkwo', party: 'Democratic', avatar: 'https://i.pravatar.cc/96?img=47' },
			{ key: '4', name: 'James Whitfield', party: 'Republican' },
		],
		seatCount: 4,
		now: new Date('2026-12-01T12:00:00'),
	},
};

export const CreamBackground: Story = {
	args: {
		...FilingOpen.args,
		backgroundColor: 'cream',
	},
};
