import type { Meta, StoryObj } from '@storybook/react';
import { CTACard } from './CTACard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof CTACard> = {
	title: 'Molecules/CTA Card',
	component: CTACard,
	render: args => (
		<Container size='sm'>
			<CTACard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		label: 'Label',
		title: 'This is a test title to be used for a card preview',
		href: '/',
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

export const White: Story = {
	args: {
		...Default.args,
		color: 'white',
	},
	parameters: {
		...Default.parameters,
	},
};
