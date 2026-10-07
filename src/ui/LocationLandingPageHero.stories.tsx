import type { Meta, StoryObj } from '@storybook/react';
import { LocationLandingPageHero } from './LocationLandingPageHero.tsx';

const meta: Meta<typeof LocationLandingPageHero> = {
	title: 'New Components/Page Sections/Location Landing Page Hero',
	component: LocationLandingPageHero,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2188-38655',
		},
	},
	render: args => <LocationLandingPageHero {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

const electionDayStat = { _key: 'election-day', value: 'Nov. 4, 2026', description: 'Election day', color: 'bright-yellow' as const };
const racesStat = { _key: 'races', value: '[##]', description: 'Races on the ballot', color: 'halo-green' as const };
const independentsStat = { _key: 'independents', value: '[##]', description: 'Independent candidates', color: 'lavender' as const };
const designStats = [electionDayStat, racesStat, independentsStat];

const localRacesButton = { _key: 'local-races', buttonType: 'anchor' as const, href: '#local-races', label: 'Browse local races' };
const independentsButton = {
	_key: 'independents',
	buttonType: 'anchor' as const,
	href: '#independents',
	label: "See who's an independent",
};
const designButtons = [localRacesButton, independentsButton];

const designBodyCopy =
	'A free, nonpartisan guide to local elections in Illinois. Learn about candidates and officials on your ballot, including who is independent of partisan and big-money influence.';

export const Default: Story = {
	args: {
		headline: 'Upcoming elections in Illinois',
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: designBodyCopy,
		backgroundColor: 'midnight',
		stats: designStats,
		buttons: designButtons,
	},
};

export const Cream: Story = {
	args: {
		...Default.args,
		headline: 'Upcoming elections in Texas',
		stateName: 'Texas',
		backgroundColor: 'cream',
	},
};

export const CountyLevel: Story = {
	args: {
		...Default.args,
		headline: 'Upcoming elections in Cook County, Illinois',
		locationLevel: 'county',
		countyName: 'Cook County',
		stats: designStats,
		buttons: [localRacesButton],
	},
};

/**
 * A location with no independents (Figma 2188-38655): the lavender card shows a
 * real zero and the "See who's an independent" button is gone. The section
 * wrapper applies both rules; the UI simply draws what it is handed.
 */
export const NoIndependents: Story = {
	args: {
		...Default.args,
		stats: [electionDayStat, racesStat, { ...independentsStat, value: '0' }],
		buttons: [localRacesButton],
	},
};

/** The independent count could not be trusted, so the lavender card is hidden; the button stays because at least one independent was found. */
export const IndependentCountUnknown: Story = {
	args: {
		...Default.args,
		stats: [electionDayStat, racesStat],
	},
};

/** No stats and no buttons authored yet: the state every existing location template starts in. */
export const CopyOnly: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
	},
};

/** Without an explicit headline the block falls back to the bare location name. */
export const HeadlineFallback: Story = {
	args: {
		locationLevel: 'city',
		stateName: 'Illinois',
		countyName: 'Cook County',
		cityName: 'Chicago',
		bodyCopy: designBodyCopy,
		backgroundColor: 'midnight',
		stats: designStats,
	},
};

export const CenterAligned: Story = {
	args: {
		...CopyOnly.args,
		textAlign: 'center',
	},
};
