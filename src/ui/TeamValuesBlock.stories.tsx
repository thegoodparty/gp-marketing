import type { Meta, StoryObj } from '@storybook/react';

import { buttons } from './_data/content.tsx';
import { TeamValuesBlock, type TeamValuesCardProps } from './TeamValuesBlock.tsx';

const meta: Meta<typeof TeamValuesBlock> = {
	title: 'Page Sections/Team Values Block',
	component: TeamValuesBlock,
	render: args => <TeamValuesBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultCards: TeamValuesCardProps[] = [
	{
		heading: 'Compassion',
		icon: 'heart-handshake',
		color: 'waxflower',
		backCopy: 'We lead with empathy and listen first, centering people in every decision we make.',
	},
	{
		heading: 'Integrity',
		icon: 'shield-check',
		color: 'blue',
		backCopy: 'We act with honesty and accountability, even when it is difficult or inconvenient.',
	},
	{
		heading: 'Innovation',
		icon: 'lightbulb',
		color: 'lavender',
		backCopy: 'We challenge assumptions and test new ideas to deliver better outcomes over time.',
	},
	{
		heading: 'Community',
		icon: 'users',
		color: 'halo-green',
		backCopy: 'We collaborate with and for people, building trust through shared purpose and action.',
	},
	{
		heading: 'Transparency',
		icon: 'eye',
		color: 'bright-yellow',
		backCopy: 'We communicate clearly about what we know, what we do not, and why choices are made.',
	},
];

export const Default: Story = {
	args: {
		header: {
			label: 'Our Values',
			title: 'What drives us forward',
			copy: 'These core values guide everything we do and every decision we make.',
			buttons: buttons(),
			caption: '*A compelling caption goes here',
		},
		cards: defaultCards,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=26591-19201&m=dev',
		},
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
	parameters: Default.parameters,
};

export const BackgroundWhite: Story = {
	args: {
		...Default.args,
		backgroundColor: 'white',
	},
	parameters: Default.parameters,
};

export const ThreeCards: Story = {
	args: {
		...Default.args,
		cards: defaultCards.slice(0, 3),
	},
	parameters: Default.parameters,
};

export const NoButtons: Story = {
	args: {
		header: {
			label: 'Our Values',
			title: 'What drives us forward',
			copy: 'These core values guide everything we do.',
		},
		cards: defaultCards,
	},
	parameters: Default.parameters,
};

export const MissingBackCopyFallback: Story = {
	args: {
		...Default.args,
		cards: defaultCards.map((card, index) => (index === 0 ? { ...card, backCopy: undefined } : card)),
	},
	parameters: Default.parameters,
};
