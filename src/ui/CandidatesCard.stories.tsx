import type { Meta, StoryObj } from '@storybook/react';
import { CandidatesCard } from './CandidatesCard.tsx';

const meta: Meta<typeof CandidatesCard> = {
	title: 'New Components/Components/Candidates Card',
	component: CandidatesCard,
	render: args => <CandidatesCard {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'City Council Member',
		secondaryText: 'District 5',
		showBadge: true,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23684-24346&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const WithLink: Story = {
	args: {
		...Default.args,
		href: '/profile/firstname-lastname',
	},
};

export const NoBadge: Story = {
	args: {
		name: 'Jane Smith',
		partyAffiliation: 'School Board Member',
		secondaryText: 'Zone 3',
		showBadge: false,
	},
};

export const MinimalInfo: Story = {
	args: {
		name: 'John Doe',
		partyAffiliation: 'County Commissioner',
	},
};

export const WithAvatar: Story = {
	args: {
		...Default.args,
		avatarUrl: 'https://i.pravatar.cc/150?img=1',
	},
};
