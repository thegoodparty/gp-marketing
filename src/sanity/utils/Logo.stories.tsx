import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo.tsx';

const meta: Meta<typeof Logo> = {
	title: 'New Components/Icons/Logo',
	component: Logo,
	render: args => (
		<div className="flex items-center gap-4 p-4">
			<Logo {...args} />
		</div>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultParams = {
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Default: Story = {
	args: {
		width: 200,
		height: 200,
	},
	...defaultParams,
};

export const Small20x20: Story = {
	args: {
		width: 20,
		height: 20,
	},
	...defaultParams,
};

export const Small35x26: Story = {
	args: {
		width: 35,
		height: 26,
	},
	...defaultParams,
};

export const Medium36x30: Story = {
	args: {
		width: 36,
		height: 30,
	},
	...defaultParams,
};

export const Medium48x36: Story = {
	args: {
		width: 48,
		height: 36,
	},
	...defaultParams,
};

export const Medium50x37: Story = {
	args: {
		width: 50,
		height: 37,
	},
	...defaultParams,
};

export const Large100x75: Story = {
	args: {
		width: 100,
		height: 75,
	},
	...defaultParams,
};
