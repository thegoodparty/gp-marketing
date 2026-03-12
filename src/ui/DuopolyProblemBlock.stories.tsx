import type { Meta, StoryObj } from '@storybook/react';
import { DuopolyProblemBlock } from './DuopolyProblemBlock.tsx';
import { problemA } from '~/experiments/homepage/data/variantA.tsx';

const meta: Meta<typeof DuopolyProblemBlock> = {
	title: 'Page Sections/Duopoly Problem Block',
	component: DuopolyProblemBlock,
	render: args => <DuopolyProblemBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: problemA.title,
		paragraphs: problemA.paragraphs,
	},
};
