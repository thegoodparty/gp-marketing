import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon } from './ArrowRightIcon.tsx';

const meta: Meta<typeof ArrowRightIcon> = {
	title: 'New Components/Icons/Arrow Right Icon',
	component: ArrowRightIcon,
	render: args => (
		<div className="flex items-center gap-4 p-4">
			<ArrowRightIcon {...args} />
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
		size: 32,
	},
	...defaultParams,
};

export const Small: Story = {
	args: {
		size: 16,
	},
	...defaultParams,
};

export const Medium: Story = {
	args: {
		size: 48,
	},
	...defaultParams,
};

export const Large: Story = {
	args: {
		size: 64,
	},
	...defaultParams,
};

export const CustomSize: Story = {
	args: {
		size: 24,
	},
	...defaultParams,
};

export const WithCustomClassName: Story = {
	args: {
		size: 32,
		className: 'text-blue-500',
	},
	...defaultParams,
};
