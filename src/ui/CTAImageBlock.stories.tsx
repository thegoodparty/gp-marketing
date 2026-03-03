import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { CTAImageBlock } from './CTAImageBlock.tsx';

const meta: Meta<typeof CTAImageBlock> = {
	title: 'Page Sections/CTA Image Block',
	component: CTAImageBlock,
	render: args => <CTAImageBlock {...args} />,
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
		image: imageJpg(),
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const ContentCream: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
};

export const ContentMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Red: Story = {
	args: {
		...Default.args,
		color: 'red',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...Default.args,
		color: 'waxflower',
	},
	parameters: {
		...Default.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...Default.args,
		color: 'bright-yellow',
	},
	parameters: {
		...Default.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...Default.args,
		color: 'halo-green',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Blue: Story = {
	args: {
		...Default.args,
		color: 'blue',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...Default.args,
		color: 'lavender',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaAlignmentRight: Story = {
	args: {
		...Default.args,
		mediaAlignment: 'right',
	},
	parameters: {
		...Default.parameters,
	},
};
