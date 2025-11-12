import type { Meta, StoryObj } from '@storybook/react';

import { imageJpg } from './_data/media.tsx';

import { BannerBlock } from './BannerBlock.tsx';

const meta: Meta<typeof BannerBlock> = {
	title: 'Page Sections/Banner Block',
	component: BannerBlock,
	render: args => <BannerBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const avatar = {
	image: imageJpg(),
	size: 'xxl' as const,
};

const Default = {
	args: {
		copy: 'Testing banner copy',
		avatars: [avatar, avatar, avatar],
	},
};

export const Red: Story = {
	args: {
		...Default.args,
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

export const BgMidnightInverse: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
		color: 'cream',
	},
};
