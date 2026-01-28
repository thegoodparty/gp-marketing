import type { Meta, StoryObj } from '@storybook/react';

import { LocationCard } from './LocationCard.tsx';

const meta: Meta<typeof LocationCard> = {
	title: 'Components/Location Card',
	component: LocationCard,
	render: args => <LocationCard {...args} />,
	decorators: [
		Story => (
			<div className='max-w-xs'>
				<Story />
			</div>
		),
	],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23038-14414&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		cityName: 'Nashville',
		stateAbbreviation: 'TN',
		openElectionsCount: 12,
		href: '/elections/tennessee/nashville',
	},
};

export const Texas: Story = {
	args: {
		cityName: 'Austin',
		stateAbbreviation: 'TX',
		openElectionsCount: 8,
		href: '/elections/texas/austin',
	},
};

export const Florida: Story = {
	args: {
		cityName: 'Tampa',
		stateAbbreviation: 'FL',
		openElectionsCount: 15,
		href: '/elections/florida/tampa',
	},
};

export const California: Story = {
	args: {
		cityName: 'Los Angeles',
		stateAbbreviation: 'CA',
		openElectionsCount: 24,
		href: '/elections/california/los-angeles',
	},
};

export const SingleElection: Story = {
	args: {
		cityName: 'Denver',
		stateAbbreviation: 'CO',
		openElectionsCount: 1,
		href: '/elections/colorado/denver',
	},
};

export const ZeroElections: Story = {
	args: {
		cityName: 'Seattle',
		stateAbbreviation: 'WA',
		openElectionsCount: 0,
		href: '/elections/washington/seattle',
	},
};

export const NoElectionsCount: Story = {
	args: {
		cityName: 'Phoenix',
		stateAbbreviation: 'AZ',
		href: '/elections/arizona/phoenix',
	},
};

export const MultipleCards: Story = {
	decorators: [
		Story => (
			<div className='grid max-w-4xl grid-cols-3 gap-6'>
				<LocationCard cityName='Nashville' stateAbbreviation='TN' openElectionsCount={12} href='#' />
				<LocationCard cityName='Austin' stateAbbreviation='TX' openElectionsCount={8} href='#' />
				<LocationCard cityName='Tampa' stateAbbreviation='FL' openElectionsCount={15} href='#' />
			</div>
		),
	],
	render: () => <></>,
};
