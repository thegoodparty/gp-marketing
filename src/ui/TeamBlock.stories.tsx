import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { TeamBlock } from './TeamBlock.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof TeamBlock> = {
	title: 'Page Sections/Team Block',
	component: TeamBlock,
	render: args => <TeamBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const team = {
	label: 'Job title',
	title: 'Name Surname',
	href: '/',
	image: imageJpg(),
};

export const Default: Story = {
	args: {
		header: {
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			caption: '*A compelling caption goes here',
			buttons: buttons(),
		},
		items: [team, team, team, team],
	},
};

export const BgMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};
