import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg, logoSVG } from './_data/media.tsx';
import { ElectionsSearchHero } from './ElectionsSearchHero.tsx';
import { US_STATES } from '~/constants/usStates';

const meta: Meta<typeof ElectionsSearchHero> = {
	title: 'New Components/Page Sections/Elections Search Hero',
	component: ElectionsSearchHero,
	render: args => <ElectionsSearchHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const baseArgs = {
	showLogo: true,
	headerText: 'Find Elections Near You',
	bodyCopy: 'Search for elections in your area and discover local candidates running for office.',
	states: US_STATES,
	cta: {
		buttonType: 'button' as const,
		label: 'Search',
		buttonProps: {
			styleType: 'primary' as const,
		},
	},
};

export const Default: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=22892-255964',
		},
	},
};

export const WithBackgroundImage: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		backgroundImage: imageJpg(),
	},
};

export const WithoutLogo: Story = {
	args: {
		...baseArgs,
		showLogo: false,
		backgroundColor: 'midnight',
	},
};

export const WithCustomLogo: Story = {
	args: {
		...baseArgs,
		logoImage: logoSVG(),
		backgroundColor: 'midnight',
	},
};

export const WithDefaultState: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		defaultStateValue: 'CA',
	},
};

export const WithCustomCTA: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		cta: {
			buttonType: 'button' as const,
			label: 'Find My Elections',
			buttonProps: {
				styleType: 'secondary' as const,
			},
		},
	},
};

export const Minimal: Story = {
	args: {
		showLogo: false,
		headerText: 'Find Elections',
		states: US_STATES,
		backgroundColor: 'midnight',
		cta: {
			buttonType: 'button' as const,
			label: 'Search',
			buttonProps: {
				styleType: 'primary' as const,
			},
		},
	},
};

export const LongBodyCopy: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		bodyCopy: 'Search for elections in your area and discover local candidates running for office. Learn about their platforms, voting records, and policy positions. Make informed decisions about who represents you at every level of government.',
	},
};
