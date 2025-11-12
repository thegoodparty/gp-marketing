import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { ComparisonBlock } from './ComparisonBlock.tsx';
import { RichData } from '~/ui/RichData.tsx';

const meta: Meta<typeof ComparisonBlock> = {
	title: 'Page Sections/Comparison Block',
	component: ComparisonBlock,
	render: args => <ComparisonBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultParams = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			buttons: buttons(),
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

const item = {
	title: <RichData value={'Body copy'} />,
	icon: 'hand-heart',
};

const table = {
	title: 'Headline',
	list: [item, item],
};

export const ContentCream: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'red' },
		tableTwo: { ...table, color: 'red' },
		backgroundColor: 'cream',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const ContentMidnight: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'red' },
		tableTwo: { ...table, color: 'red' },
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Red: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'red' },
		tableTwo: { ...table, color: 'red' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'waxflower' },
		tableTwo: { ...table, color: 'waxflower' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'bright-yellow' },
		tableTwo: { ...table, color: 'bright-yellow' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'halo-green' },
		tableTwo: { ...table, color: 'halo-green' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Blue: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'blue' },
		tableTwo: { ...table, color: 'blue' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...defaultParams.args,
		tableOne: { ...table, color: 'lavender' },
		tableTwo: { ...table, color: 'lavender' },
	},
	parameters: {
		...defaultParams.parameters,
	},
};
