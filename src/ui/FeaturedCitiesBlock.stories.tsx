import type { Meta, StoryObj } from '@storybook/react';

import { FeaturedCitiesBlock } from './FeaturedCitiesBlock.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof FeaturedCitiesBlock> = {
	title: 'New Components/Page Sections/Featured Cities Block',
	component: FeaturedCitiesBlock,
	render: args => <FeaturedCitiesBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23038-14414&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleLocationCards = [
	{
		cityName: 'Nashville',
		stateAbbreviation: 'TN',
		openElectionsCount: 12,
		href: '/elections/tennessee/nashville',
	},
	{
		cityName: 'Austin',
		stateAbbreviation: 'TX',
		openElectionsCount: 8,
		href: '/elections/texas/austin',
	},
	{
		cityName: 'Tampa',
		stateAbbreviation: 'FL',
		openElectionsCount: 15,
		href: '/elections/florida/tampa',
	},
	{
		cityName: 'Denver',
		stateAbbreviation: 'CO',
		openElectionsCount: 6,
		href: '/elections/colorado/denver',
	},
	{
		cityName: 'Phoenix',
		stateAbbreviation: 'AZ',
		openElectionsCount: 10,
		href: '/elections/arizona/phoenix',
	},
	{
		cityName: 'Seattle',
		stateAbbreviation: 'WA',
		openElectionsCount: 9,
		href: '/elections/washington/seattle',
	},
];

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Overline',
			title: 'Headline',
			copy: 'Body copy',
			layout: 'center',
			buttons: buttons(),
		},
		locationCards: sampleLocationCards.slice(0, 3),
	},
};

export const WithRealContent: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Elections',
			title: 'Featured Cities',
			copy: 'Explore elections in these key cities across the United States.',
			layout: 'center',
			buttons: buttons(),
		},
		locationCards: sampleLocationCards.slice(0, 3),
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const LeftAlignedHeader: Story = {
	args: {
		...Default.args,
		header: {
			label: 'Overline',
			title: 'Headline',
			copy: 'Body copy',
			layout: 'left',
			buttons: buttons(),
		},
	},
};

export const ThreeCards: Story = {
	args: {
		...Default.args,
		locationCards: sampleLocationCards.slice(0, 3),
	},
};

export const SixCards: Story = {
	args: {
		...Default.args,
		locationCards: sampleLocationCards,
	},
};

export const NoHeader: Story = {
	args: {
		backgroundColor: 'cream',
		locationCards: sampleLocationCards.slice(0, 3),
	},
};
