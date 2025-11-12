import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { StatsBlock } from './StatsBlock.tsx';

const meta: Meta<typeof StatsBlock> = {
	title: 'Page Sections/Stats Block',
	component: StatsBlock,
	render: args => <StatsBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const stat = {
	value: 'XXXX',
	description: 'Label copy',
};

const Default = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			caption: 'This is a test caption',
			buttons: buttons(),
			layout: 'left',
		},
		stats: [
			{ ...stat, color: 'cream' as const },
			{ ...stat, color: 'cream' as const },
			{ ...stat, color: 'midnight' as const },
			{ ...stat, color: 'midnight' as const },
		],
	},
};

export const StackedDefault: Story = {
	args: {
		...Default.args,
	},
};

export const SideBySideDefault: Story = {
	args: {
		...Default.args,
		layout: 'side-by-side',
	},
};

export const StackedBgMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const SideBySideBgMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
		layout: 'side-by-side',
	},
};
