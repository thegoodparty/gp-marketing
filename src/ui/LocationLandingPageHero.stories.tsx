import type { Meta, StoryObj } from '@storybook/react';
import { LocationLandingPageHero } from './LocationLandingPageHero.tsx';

const meta: Meta<typeof LocationLandingPageHero> = {
	title: 'New Components/Page Sections/Location Landing Page Hero',
	component: LocationLandingPageHero,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=3096-2855',
		},
	},
	render: args => <LocationLandingPageHero {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

const designStats = [
	{ _key: 'days', value: '[##]', description: 'days until the next election', color: 'bright-yellow' as const },
	{ _key: 'positions', value: '[##]', description: 'positions up for election', color: 'halo-green' as const },
	{ _key: 'independents', value: '[##]', description: 'independents on the ballot', color: 'lavender' as const },
	{ _key: 'uncontested', value: '[##]', description: 'uncontested elections in Illinois', color: 'blue' as const },
];

export const WithStats: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Browse elections in Illinois',
		bodyCopy: 'Your anti-corruption voter guide. Find independent candidates on your ballot and representatives in office.',
		backgroundColor: 'midnight',
		stats: designStats,
	},
};

export const StateLevel: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
	},
};

export const StateLevelCream: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'cream',
	},
};

export const CountyLevel: Story = {
	args: {
		locationLevel: 'county',
		stateName: 'Illinois',
		countyName: 'Cook County',
		bodyCopy: 'Explore elections in this county',
		backgroundColor: 'midnight',
	},
};

export const CountyLevelCream: Story = {
	args: {
		locationLevel: 'county',
		stateName: 'Illinois',
		countyName: 'Cook County',
		bodyCopy: 'Explore elections in this county',
		backgroundColor: 'cream',
	},
};

export const CityLevel: Story = {
	args: {
		locationLevel: 'city',
		stateName: 'Illinois',
		countyName: 'Cook County',
		cityName: 'Chicago',
		bodyCopy: 'Explore elections in this city',
		backgroundColor: 'midnight',
	},
};

export const CityLevelCream: Story = {
	args: {
		locationLevel: 'city',
		stateName: 'Illinois',
		countyName: 'Cook County',
		cityName: 'Chicago',
		bodyCopy: 'Explore elections in this city',
		backgroundColor: 'cream',
	},
};

export const CustomBodyCopy: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'California',
		bodyCopy: 'Find independent, third-party, and non-partisan candidates running for office in California',
		backgroundColor: 'midnight',
	},
};

export const WithStatsCream: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Browse elections in Texas',
		bodyCopy: 'Your anti-corruption voter guide. Find independent candidates on your ballot and representatives in office.',
		backgroundColor: 'cream',
		stats: designStats,
	},
};

export const LeftAligned: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
		textAlign: 'left',
	},
};

export const CenterAligned: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
		textAlign: 'center',
	},
};

export const RightAligned: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Illinois',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
		textAlign: 'right',
	},
};
