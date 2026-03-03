import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from './_data/content.tsx';
import { PricingCard } from './PricingCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof PricingCard> = {
	title: 'Molecules/Pricing Card',
	component: PricingCard,
	render: args => (
		<Container size='xs'>
			<PricingCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		name: 'Subhead',
		price: '$XX',
		billingPeriod: 'per month',
		listTitle: 'List item context:',
		list: ['List item 1', 'List item 2', 'List item 3', 'List item 4', 'List item 5', 'List item 6'],
		button: primaryButton,
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Red: Story = {
	args: {
		...Default.args,
		color: 'red',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...Default.args,
		color: 'waxflower',
	},
	parameters: {
		...Default.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...Default.args,
		color: 'bright-yellow',
	},
	parameters: {
		...Default.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...Default.args,
		color: 'halo-green',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Blue: Story = {
	args: {
		...Default.args,
		color: 'blue',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...Default.args,
		color: 'lavender',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Midnight: Story = {
	args: {
		...Default.args,
		color: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};
