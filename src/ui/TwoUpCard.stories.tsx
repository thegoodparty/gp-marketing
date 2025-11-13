import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from './_data/content.tsx';
import { TwoUpCard } from './TwoUpCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof TwoUpCard> = {
	title: 'Molecules/Two Up Card',
	component: TwoUpCard,
	render: args => (
		<Container size='sm'>
			<TwoUpCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		title: 'Headline goes here across two lines',
		list: [
			{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
			{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
			{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
		],
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
