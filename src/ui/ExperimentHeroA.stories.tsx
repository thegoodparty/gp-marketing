import type { Meta, StoryObj } from '@storybook/react';
import { ExperimentHeroA } from './ExperimentHeroA.tsx';
import { heroA } from '~/experiments/homepage/data/variantA.tsx';

const meta: Meta<typeof ExperimentHeroA> = {
	title: 'Page Sections/Experiment Hero A',
	component: ExperimentHeroA,
	render: args => <ExperimentHeroA {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		badgeText: heroA.badgeText,
		title: heroA.title,
		subtitle: heroA.subtitle,
		buttons: heroA.buttons,
	},
};
