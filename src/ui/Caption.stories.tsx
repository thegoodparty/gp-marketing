import type { Meta, StoryObj } from '@storybook/react';

import { Caption } from './Caption.tsx';

const meta: Meta<typeof Caption> = {
	title: 'Atoms/Caption',
	component: Caption,
	render: args => <Caption {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: '*A compelling caption goes here',
	},
};
