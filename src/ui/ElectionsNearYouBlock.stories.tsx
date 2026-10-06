import type { Meta, StoryObj } from '@storybook/react';

import { imageJpg } from './_data/media.tsx';

import { ElectionsNearYouBlock } from './ElectionsNearYouBlock.tsx';

const meta: Meta<typeof ElectionsNearYouBlock> = {
	title: 'New Components/Page Sections/Elections Near You Block',
	component: ElectionsNearYouBlock,
	render: args => <ElectionsNearYouBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=3096-3858',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const avatar = { image: imageJpg() };
const socialProof = {
	showSocialProof: true,
	socialProofText: '13,000+ independents won with GoodParty.org',
	socialProofAvatars: [
		{ ...avatar, _key: 'one' },
		{ ...avatar, _key: 'two' },
		{ ...avatar, _key: 'three' },
	],
};

export const Default: Story = {
	args: {
		layout: 'contained' as const,
		backgroundColor: 'midnight',
		heading: 'Find more elections near you',
		body: "Enter your city to see every race on your ballot and discover independent candidates who've pledged to put voters first.",
		buttonLabel: 'Search',
	},
};

export const Cream: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};

// The full-width frames (3093:3901 desktop, 3093:4197 mobile) draw the social
// proof row; the contained frame does not. The two are separate editor choices
// so each combination gets a story.
export const FullWidth: Story = {
	args: {
		...Default.args,
		layout: 'fullWidth' as const,
		...socialProof,
	},
};

export const FullWidthMobile: Story = {
	args: FullWidth.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};

export const FullWidthCream: Story = {
	args: {
		...FullWidth.args,
		backgroundColor: 'cream',
	},
};

export const FullWidthWithoutSocialProof: Story = {
	args: {
		...Default.args,
		layout: 'fullWidth' as const,
	},
};

export const ContainedWithSocialProof: Story = {
	args: {
		...Default.args,
		...socialProof,
	},
};
