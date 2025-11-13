import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from './_data/content.tsx';
import { CTABannerBlock } from './CTABannerBlock.tsx';

const meta: Meta<typeof CTABannerBlock> = {
	title: 'Page Sections/CTA Banner Block',
	component: CTABannerBlock,
	render: args => <CTABannerBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		title: 'This is a test title',
		copy: 'This is a test of the summary description',
		button: primaryButton,
		color: 'midnight',
	},
};

export const DefaultInverse = {
	args: {
		...Default.args,
		color: 'midnight',
	},
};

export const BackgroundMidnightInverse = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
		color: 'cream',
	},
};

export const Red: Story = {
	args: {
		...Default.args,
		color: 'red',
	},
};

export const Waxflower: Story = {
	args: {
		...Default.args,
		color: 'waxflower',
	},
};

export const BrightYellow: Story = {
	args: {
		...Default.args,
		color: 'bright-yellow',
	},
};

export const HaloGreen: Story = {
	args: {
		...Default.args,
		color: 'halo-green',
	},
};

export const Blue: Story = {
	args: {
		...Default.args,
		color: 'blue',
	},
};

export const Lavender: Story = {
	args: {
		...Default.args,
		color: 'lavender',
	},
};
