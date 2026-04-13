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
	{ heading: 'Compassion', icon: 'heart-handshake', color: 'waxflower', href: '/values/compassion' },
	{ heading: 'Integrity', icon: 'shield-check', color: 'blue', href: '/values/integrity' },
	{ heading: 'Innovation', icon: 'lightbulb', color: 'lavender', href: '/values/innovation' },
	{ heading: 'Community', icon: 'users', color: 'halo-green', href: '/values/community' },
	{ heading: 'Transparency', icon: 'eye', color: 'bright-yellow', href: '/values/transparency' },
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
