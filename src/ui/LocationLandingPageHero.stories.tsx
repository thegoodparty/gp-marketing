import type { Meta, StoryObj } from '@storybook/react';
import { LocationLandingPageHero } from './LocationLandingPageHero.tsx';

const meta: Meta<typeof LocationLandingPageHero> = {
	title: 'New Components/Page Sections/Location Landing Page Hero',
	component: LocationLandingPageHero,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2032-21473',
		},
	},
	render: args => <LocationLandingPageHero {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

const designStats = [
	{ _key: 'election-day', value: 'Nov. 4, 2026', description: 'Election day', color: 'bright-yellow' as const },
	{ _key: 'races', value: '[##]', description: 'Races on the ballot', color: 'halo-green' as const },
	{ _key: 'independents', value: '[##]', description: 'Independent candidates', color: 'lavender' as const },
];

const localRacesButton = { _key: 'local-races', buttonType: 'anchor' as const, href: '#local-races', label: 'Browse local races' };
const allElectionsButton = { _key: 'all-elections', buttonType: 'anchor' as const, href: '#all-elections', label: 'Search all elections' };
const designButtons = [localRacesButton, allElectionsButton];

const designBodyCopy = 'Your anti-corruption voter guide. Find independent candidates on your ballot and representatives in office.';

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
