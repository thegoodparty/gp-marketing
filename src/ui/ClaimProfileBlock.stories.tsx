import type { Meta, StoryObj } from '@storybook/react';
import { ClaimProfileBlock } from './ClaimProfileBlock.tsx';

const meta: Meta<typeof ClaimProfileBlock> = {
	title: 'New Components/Page Sections/Claim Profile Block',
	component: ClaimProfileBlock,
	render: args => <ClaimProfileBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const exampleCard = {
	name: 'Firstname Lastname',
	partyAffiliation: 'City Council Member',
	href: '#',
	isGoodPartyCandidate: true,
};

export const Default: Story = {
	args: {
		backgroundColor: 'bright-yellow',
		headline: 'See Their Policy Position',
		body: 'View detailed policy positions and political claims from candidates in your district',
		claimButton: {
			buttonType: 'internal',
			href: '/candidates',
			label: 'View All Claims',
		},
		exampleCard,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23684-24346&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const MidnightBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const CreamBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
};

export const WithLongText: Story = {
	args: {
		...Default.args,
		headline: 'Explore Candidate Policy Claims',
		body: 'Discover where candidates stand on key issues. Browse their articulated demands, policy proposals, and public statements on matters that affect your community.',
	},
};

export const MinimalContent: Story = {
	args: {
		backgroundColor: 'bright-yellow',
		headline: 'Review Policy Positions',
		claimButton: {
			buttonType: 'internal',
			href: '/candidates',
			label: 'Browse Claims',
		},
		exampleCard: {
			name: 'Jane Smith',
			partyAffiliation: 'School Board Trustee',
			href: '#',
		},
	},
};

export const BannerLayout: Story = {
	args: {
		layout: 'banner',
		backgroundColor: 'cream',
		headline: 'This profile is unclaimed',
		body: 'Enhance your profile by signing up.',
		claimButton: {
			buttonType: 'internal',
			href: 'https://app.goodparty.org/sign-up',
			label: 'Join today',
		},
	},
};
