import type { Meta, StoryObj } from '@storybook/react';
import { LocationLandingPageHero } from './LocationLandingPageHero.tsx';

const meta: Meta<typeof LocationLandingPageHero> = {
	title: 'Page Sections/Location Landing Page Hero',
	component: LocationLandingPageHero,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23657-17212&t=6DQyxTAl7Ola6AF3-0',
		},
	},
	render: args => <LocationLandingPageHero {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const CustomSearchPlaceholder: Story = {
	args: {
		locationLevel: 'state',
		stateName: 'Texas',
		bodyCopy: 'Explore elections in this state',
		backgroundColor: 'midnight',
		searchPlaceholder: 'Search by city or county name',
	},
};
