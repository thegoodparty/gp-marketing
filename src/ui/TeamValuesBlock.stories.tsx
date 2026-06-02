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
		heading: 'People First',
		icon: 'heart-handshake',
		color: 'waxflower',
		backCopy:
			'Our priority is to make systems serve people, not the other way around. We center on our shared humanity and integrate diverse perspectives in pursuit of the greater good.',
	},
	{
		heading: 'Direct, Open and Honest',
		icon: 'message-circle',
		color: 'blue',
		backCopy:
			'Anti-political in all the right ways: we operate with integrity, engage in direct civil discourse and openly give and receive honest feedback.',
	},
	{
		heading: 'Empowered Ownership',
		icon: 'key',
		color: 'lavender',
		backCopy:
			'We are high-agency problem solvers – independent thinkers, empowered with freedom to act, and responsibility to deliver results that advance our mission.',
	},
	{
		heading: 'Iterate for Impact',
		icon: 'rocket',
		color: 'halo-green',
		backCopy:
			'We work with urgency and purpose. We rapidly ideate, test, learn and improve everything we do to maximize positive impact.',
	},
	{
		heading: 'Fun Is Fuel',
		icon: 'party-popper',
		color: 'bright-yellow',
		backCopy:
			"Our work is hard. That's why having fun, celebrating each other and our successes is important. It fuels our humanity, keeping us optimistic and connected. Besides, everybody loves a good party!",
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
