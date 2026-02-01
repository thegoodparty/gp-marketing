import type { Meta, StoryObj } from '@storybook/react';

import { CandidatesCard1 } from './CandidatesCard1.tsx';
import { imageJpg } from './_data/media.tsx';

const meta: Meta<typeof CandidatesCard1> = {
	title: 'New Components/UI/Candidates Card 1',
	component: CandidatesCard1,
	render: args => <CandidatesCard1 {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24609-38132&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		href: '/candidates/firstname-lastname',
	},
};

export const WithPhoto: Story = {
	args: {
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		avatar: imageJpg(),
		href: '/candidates/firstname-lastname',
	},
};

export const WithInitials: Story = {
	args: {
		name: 'Jane Smith',
		partyAffiliation: 'Independent',
		href: '/candidates/jane-smith',
	},
};

export const LongPartyName: Story = {
	args: {
		name: 'Alexandria Martinez',
		partyAffiliation: 'Democratic Party',
		avatar: imageJpg(),
		href: '/candidates/alexandria-martinez',
	},
};
