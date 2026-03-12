import type { Meta, StoryObj } from '@storybook/react';
import { StrikethroughBlock } from './StrikethroughBlock.tsx';
import { strikethroughB } from '~/experiments/homepage/data/variantB.tsx';

const meta: Meta<typeof StrikethroughBlock> = {
	title: 'Page Sections/Strikethrough Block',
	component: StrikethroughBlock,
	render: args => <StrikethroughBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		lines: strikethroughB.lines,
		punchline: strikethroughB.punchline,
	},
};
