import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { CTABlock } from './CTABlock.tsx';

const meta: Meta<typeof CTABlock> = {
	title: 'Page Sections/CTA Block',
	component: CTABlock,
	render: args => <CTABlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		label: 'Test label',
		title: 'This is a test title',
		copy: 'This is a test of the summary description',
		buttons: buttons(),
		caption: 'Caption goes here',
	},
};

export const BackgroundMidnightInverse: Story = {
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

export const Condensed: Story = {
	args: {
		...Default.args,
		size: 'condensed',
	},
};

export const CondensedBackgroundMidnightInverse: Story = {
	args: {
		...Condensed.args,
		size: 'condensed',
		backgroundColor: 'midnight',
		color: 'cream',
	},
};
