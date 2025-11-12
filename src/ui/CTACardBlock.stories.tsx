import type { Meta, StoryObj } from '@storybook/react';
import { CTACardBlock } from './CTACardBlock.tsx';

const meta: Meta<typeof CTACardBlock> = {
	title: 'Page Sections/CTA Card Block',
	component: CTACardBlock,
	render: args => <CTACardBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const cardOne = {
	label: 'Label',
	title: 'This is a test title',
	href: '/',
	color: 'red',
};

const cardTwo = {
	label: 'Label',
	title: 'This is a test title',
	href: '/',
	color: 'blue',
};

export const Default: Story = {
	args: {
		card1: cardOne,
		card2: cardTwo,
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		card1: { ...cardOne, color: 'cream' },
		card2: { ...cardOne, color: 'blue' },
		backgroundColor: 'midnight',
	},
};
