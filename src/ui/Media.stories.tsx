import type { Meta, StoryObj } from '@storybook/react';

import { imageJpg, muxVideo } from './_data/media.tsx';

import { Media } from './Media.tsx';

const meta: Meta<typeof Media> = {
	title: 'Molecules/Media',
	component: Media,
	render: args => <Media {...args} />,
};

export default meta;

type Story = StoryObj<typeof Media>;

const Default = {
	args: {
		image: imageJpg(),
	},
};

export const Image: Story = {
	args: {
		...Default.args,
	},
};

export const Video: Story = {
	args: {
		...Default.args,
		video: muxVideo,
	},
};
