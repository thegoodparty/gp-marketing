import type { Meta, StoryObj } from '@storybook/react';

import { FeaturedCandidatesBlock } from './FeaturedCandidatesBlock.tsx';

const meta: Meta<typeof FeaturedCandidatesBlock> = {
	title: 'New Components/Page Sections/Featured Candidates Block',
	component: FeaturedCandidatesBlock,
	render: args => <FeaturedCandidatesBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const callout = (
	<p>
		This voter guide was built by GoodParty.org, a public benefit corporation that helps independents run for office, win elections, and serve
		their local communities. The Heart & Star badge marks candidates and officials who have signed the{' '}
		<a href='https://goodparty.org'>GoodParty.org Pledge</a> to serve people, not political parties or big money.
	</p>
);

const people = Array.from({ length: 6 }, (_, i) => ({
	key: `person-${i}`,
	name: '[Candidate Name]',
	office: '[Office held]',
	location: '[City, SS]',
	href: `/people/person-${i}`,
	avatarUrl: `https://i.pravatar.cc/400?img=${i + 11}`,
	isPledged: i < 4,
}));

export const Default: Story = {
	args: {
		heading: 'Featured candidates and representatives',
		callout,
		people,
	},
};

export const Midnight: Story = {
	args: {
		backgroundColor: 'midnight',
		heading: 'Featured candidates and representatives',
		callout,
		people,
	},
};

export const WithoutCalloutOrPhotos: Story = {
	args: {
		heading: 'Featured candidates in Houston',
		people: people.map(person => ({ ...person, avatarUrl: null, name: 'Jane Q. Doe' })),
	},
};

export const Empty: Story = {
	args: {
		heading: 'Featured candidates and representatives',
		callout,
		people: [],
	},
};
