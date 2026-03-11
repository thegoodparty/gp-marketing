import type { Meta, StoryObj } from '@storybook/react';
import { ExperimentHeroB } from './ExperimentHeroB.tsx';
import { heroB } from '~/experiments/homepage/data/variantB.tsx';

const meta: Meta<typeof ExperimentHeroB> = {
	title: 'Page Sections/Experiment Hero B',
	component: ExperimentHeroB,
	render: args => <ExperimentHeroB {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		manifesto: heroB.manifesto,
		title: heroB.title,
		subtitle: heroB.subtitle,
		buttons: heroB.buttons,
	},
};
