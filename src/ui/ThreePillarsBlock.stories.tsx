import type { Meta, StoryObj } from '@storybook/react';
import { ThreePillarsBlock } from './ThreePillarsBlock.tsx';
import { pillarsHeaderB, pillarsB } from '~/experiments/homepage/data/variantB.tsx';

const meta: Meta<typeof ThreePillarsBlock> = {
	title: 'Page Sections/Three Pillars Block',
	component: ThreePillarsBlock,
	render: args => <ThreePillarsBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		header: pillarsHeaderB,
		pillars: pillarsB,
	},
};
