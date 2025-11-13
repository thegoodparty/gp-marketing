import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { Avatar } from './Avatar.tsx';

const meta: Meta<typeof Avatar> = {
	title: 'Atoms/Avatar',
	component: Avatar,
	render: args => <Avatar {...args} />,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

const Default = {
	args: {
		image: imageJpg(),
	},
};

export const Large: Story = {
	args: {
		...Default.args,
	},
};

export const Small: Story = {
	args: {
		...Default.args,
		size: 'sm',
	},
};
