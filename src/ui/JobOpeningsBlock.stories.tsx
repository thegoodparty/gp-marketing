import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content';
import { JobOpeningsBlock } from './JobOpeningsBlock';

const meta: Meta<typeof JobOpeningsBlock> = {
	title: 'Page Sections/Job Openings Block',
	component: JobOpeningsBlock,
	render: args => <JobOpeningsBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=26552-26034',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultCards = [
	{
		title: 'Senior Software Engineer',
		tag: 'Engineering',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/senior-software-engineer',
	},
	{
		title: 'Product Designer',
		tag: 'Design',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/product-designer',
	},
	{
		title: 'Marketing Manager',
		tag: 'Marketing',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/marketing-manager',
	},
	{
		title: 'Data Analyst',
		tag: 'Data',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/data-analyst',
	},
	{
		title: 'Community Manager',
		tag: 'Community',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/community-manager',
	},
	{
		title: 'DevOps Engineer',
		tag: 'Engineering',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/devops-engineer',
	},
	{
		title: 'Content Strategist',
		tag: 'Marketing',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/content-strategist',
	},
	{
		title: 'UX Researcher',
		tag: 'Design',
		location: 'Remote (United States)',
		jobType: 'Full-Time',
		href: '/careers/ux-researcher',
	},
];

export const Default: Story = {
	args: {
		header: {
			label: 'Overline',
			title: 'Headline',
			copy: 'Body copy',
			buttons: buttons(),
		},
		cards: defaultCards,
	},
};

export const FourCards: Story = {
	args: {
		header: {
			label: 'Careers',
			title: 'Join our team',
			copy: 'We are looking for passionate people to help us build a better democracy.',
			buttons: buttons(),
		},
		cards: defaultCards.slice(0, 4),
	},
};

export const WithoutButtons: Story = {
	args: {
		header: {
			label: 'Open Positions',
			title: 'Current job openings',
			copy: 'Find your next opportunity with us.',
		},
		cards: defaultCards.slice(0, 4),
	},
};

export const SingleCard: Story = {
	args: {
		header: {
			label: 'Careers',
			title: 'Featured role',
			copy: 'A unique opportunity to make an impact.',
		},
		cards: defaultCards.slice(0, 1),
	},
};

export const Empty: Story = {
	args: {
		header: {
			label: 'Careers',
			title: 'Work With Us',
			copy: 'Join our team and help make democracy more accessible.',
		},
		cards: [],
	},
};
