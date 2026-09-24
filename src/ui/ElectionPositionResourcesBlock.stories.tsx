import type { Meta, StoryObj } from '@storybook/react';

import { ElectionPositionResourcesBlock, type ElectionPositionResourceCardProps } from './ElectionPositionResourcesBlock.tsx';

const meta: Meta<typeof ElectionPositionResourcesBlock> = {
	title: 'New Components/Page Sections/Election Position Resources Block',
	component: ElectionPositionResourcesBlock,
	render: args => <ElectionPositionResourcesBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=2974-26931',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const guide: ElectionPositionResourceCardProps = {
	label: 'Guide',
	title: 'How to Run for City Council',
	description: 'A step-by-step guide to running for City Council as an independent candidate - from deciding to run to election night.',
	icon: 'book-open',
	color: 'waxflower',
	button: { buttonType: 'internal', href: '/blog/article/how-to-run-for-city-council', label: 'Read the guide' },
};

const ebook: ElectionPositionResourceCardProps = {
	label: 'E-book',
	title: '2026 Political Campaign Playbook',
	description: 'Your guide to launching a local campaign in 2026, with advice from winning candidates across the country.',
	icon: 'book-open',
	color: 'lavender',
	button: { buttonType: 'internal', href: '/e-book', label: 'Read the guide' },
};

const support: ElectionPositionResourceCardProps = {
	label: 'Free support',
	title: 'Get free training and support',
	description: "Free coaching and training from our team and candidates who've run and won.",
	icon: 'headset',
	color: 'bright-yellow',
	button: { buttonType: 'external', href: 'https://community.goodparty.org', label: 'Connect with us' },
};

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		cards: [guide, ebook, support],
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

/** A page that supplies no guide link and has none set in Studio: the guide card is left out. */
export const WithoutGuide: Story = {
	args: {
		backgroundColor: 'cream',
		cards: [ebook, support],
	},
};
