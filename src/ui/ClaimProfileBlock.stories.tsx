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
	secondaryText: 'District 5',
	showBadge: true,
};

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
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

export const BrightYellowBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'bright-yellow',
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
		backgroundColor: 'cream',
		headline: 'Review Policy Positions',
		claimButton: {
			buttonType: 'internal',
			href: '/candidates',
			label: 'Browse Claims',
		},
		exampleCard: {
			name: 'Jane Smith',
			partyAffiliation: 'School Board Trustee',
		},
	},
};
