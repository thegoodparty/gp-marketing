import type { Meta, StoryObj } from '@storybook/react';

import { CandidatesCard } from './CandidatesCard.tsx';
import { imageJpg } from './_data/media.tsx';

const meta: Meta<typeof CandidatesCard> = {
	title: 'New Components/UI/Candidates Card',
	component: CandidatesCard,
	render: args => <CandidatesCard {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24609-38132&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		href: '/candidates/firstname-lastname',
		isGoodPartyCandidate: false,
	},
};

export const StandardWithPhoto: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		avatar: imageJpg(),
		href: '/candidates/firstname-lastname',
		isGoodPartyCandidate: false,
	},
};

export const StandardWithInitials: Story = {
	args: {
		name: 'Jane Smith',
		partyAffiliation: 'Independent',
		href: '/candidates/jane-smith',
		isGoodPartyCandidate: false,
	},
};

export const GoodParty: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		href: '/candidates/firstname-lastname',
		isGoodPartyCandidate: true,
	},
};

export const GoodPartyWithPhoto: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		avatar: imageJpg(),
		href: '/candidates/firstname-lastname',
		isGoodPartyCandidate: true,
	},
};

export const GoodPartyWithInitials: Story = {
	args: {
		name: 'Jane Smith',
		partyAffiliation: 'Independent',
		href: '/candidates/jane-smith',
		isGoodPartyCandidate: true,
	},
};

export const LongPartyName: Story = {
	args: {
		name: 'Alexandria Martinez',
		partyAffiliation: 'Democratic Party',
		avatar: imageJpg(),
		href: '/candidates/alexandria-martinez',
		isGoodPartyCandidate: false,
	},
};

export const LongPartyNameGoodParty: Story = {
	args: {
		name: 'Alexandria Martinez',
		partyAffiliation: 'Democratic Party',
		avatar: imageJpg(),
		href: '/candidates/alexandria-martinez',
		isGoodPartyCandidate: true,
	},
};
