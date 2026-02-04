import type { Meta, StoryObj } from '@storybook/react';
import { StateIcon } from './StateIcon.tsx';

const meta: Meta<typeof StateIcon> = {
	title: 'New Components/Icons/State Icon',
	component: StateIcon,
	render: args => (
		<div className="flex items-center gap-4 p-4">
			<StateIcon {...args} />
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
		stateCode: 'TX',
		width: 24,
		height: 24,
	},
	...defaultParams,
};

export const California: Story = {
	args: {
		stateCode: 'CA',
		width: 24,
		height: 24,
	},
	...defaultParams,
};

export const NewYork: Story = {
	args: {
		stateCode: 'NY',
		width: 24,
		height: 24,
	},
	...defaultParams,
};

export const Florida: Story = {
	args: {
		stateCode: 'FL',
		width: 24,
		height: 24,
	},
	...defaultParams,
};

export const Small: Story = {
	args: {
		stateCode: 'TX',
		width: 16,
		height: 16,
	},
	...defaultParams,
};

export const Medium: Story = {
	args: {
		stateCode: 'TX',
		width: 48,
		height: 48,
	},
	...defaultParams,
};

export const Large: Story = {
	args: {
		stateCode: 'TX',
		width: 100,
		height: 100,
	},
	...defaultParams,
};

export const CustomSize: Story = {
	args: {
		stateCode: 'CA',
		width: 64,
		height: 64,
	},
	...defaultParams,
};

export const MultipleStates: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4 p-4">
			<StateIcon stateCode="TX" width={32} height={32} />
			<StateIcon stateCode="CA" width={32} height={32} />
			<StateIcon stateCode="NY" width={32} height={32} />
			<StateIcon stateCode="FL" width={32} height={32} />
			<StateIcon stateCode="IL" width={32} height={32} />
			<StateIcon stateCode="PA" width={32} height={32} />
			<StateIcon stateCode="OH" width={32} height={32} />
			<StateIcon stateCode="GA" width={32} height={32} />
		</div>
	),
	...defaultParams,
};
