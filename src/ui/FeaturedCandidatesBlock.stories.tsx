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

const heading = 'Candidates and officials who took the GoodParty.org Pledge';

const bodyCopy = 'Candidates and elected officials near you who have taken the GoodParty.org Pledge. Read why they’re running and serving, in their own words.';

const callout = {
	title: 'What this symbol means',
	body: (
		<p>
			Candidates and elected officials with this symbol took the <strong>GoodParty.org Pledge</strong>, promising to serve people first,
			independent of both major parties and big-money interests.
		</p>
	),
	pledgeLinkLabel: 'Read the full pledge',
};

const people = Array.from({ length: 6 }, (_, i) => ({
	key: `person-${i}`,
	name: '[Candidate Name]',
	office: '[Office held]',
	location: '[City, SS]',
	href: `/people/person-${i}`,
	avatarUrl: `https://i.pravatar.cc/400?img=${i + 11}`,
	isPledged: true,
}));

export const Default: Story = {
	args: {
		heading,
		bodyCopy,
		callout,
		people,
	},
};

export const WithCount: Story = {
	args: {
		heading,
		bodyCopy: 'There are 5 candidates and elected officials who have taken the GoodParty.org Pledge in Bay County. Read why they’re running and serving, in their own words.',
		callout,
		people,
	},
};

export const Midnight: Story = {
	args: {
		backgroundColor: 'midnight',
		heading,
		bodyCopy,
		callout,
		people,
	},
};

export const WithoutCalloutOrPhotos: Story = {
	args: {
		heading: 'Pledged candidates in Houston',
		people: people.map(person => ({ ...person, avatarUrl: null, name: 'Jane Q. Doe' })),
	},
};

export const Empty: Story = {
	args: {
		heading,
		bodyCopy,
		callout,
		people: [],
	},
};
