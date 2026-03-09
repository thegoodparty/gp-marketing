import type { Meta, StoryObj } from '@storybook/react';

import { CandidatesBlock } from './CandidatesBlock.tsx';
import { primaryButton } from './_data/content.tsx';
import { imageJpg, imageJpgAlt } from './_data/media.tsx';

const meta: Meta<typeof CandidatesBlock> = {
	title: 'New Components/Page Sections/Candidates Block',
	component: CandidatesBlock,
	render: args => <CandidatesBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24609-38132&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockCandidates = [
	{
		_key: '1',
		name: 'Firstname Lastname',
		partyAffiliation: 'Party Affiliation',
		avatar: imageJpg(),
		href: '/candidates/firstname-lastname',
	},
	{
		_key: '2',
		name: 'Jane Smith',
		partyAffiliation: 'Independent',
		href: '/candidates/jane-smith',
	},
	{
		_key: '3',
		name: 'Alexandria Martinez',
		partyAffiliation: 'Democratic Party',
		avatar: imageJpgAlt(),
		href: '/candidates/alexandria-martinez',
		isGoodPartyCandidate: true,
	},
	{
		_key: '4',
		name: 'Robert Johnson',
		partyAffiliation: 'Republican Party',
		href: '/candidates/robert-johnson',
	},
	{
		_key: '5',
		name: 'Sarah Williams',
		partyAffiliation: 'Green Party',
		avatar: imageJpg(),
		href: '/candidates/sarah-williams',
		isGoodPartyCandidate: true,
	},
	{
		_key: '6',
		name: 'Michael Brown',
		partyAffiliation: 'Libertarian',
		href: '/candidates/michael-brown',
	},
];

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Meet the Candidates',
			title: 'Candidates',
			copy: 'Browse independent candidates running for office in your area.',
			layout: 'left',
		},
		candidates: mockCandidates,
	},
};

export const WithCTAButton: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			title: 'Candidates',
			copy: 'Browse independent candidates running for office.',
			layout: 'left',
		},
		candidates: mockCandidates,
		hasFilters: false,
		optionalButton: {
			...primaryButton,
			label: 'Become a Candidate',
			href: '/run',
		},
	},
};

export const WithPagination: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			title: 'Candidates',
			layout: 'left',
		},
		candidates: [...mockCandidates, ...mockCandidates, ...mockCandidates],
		enablePagination: true,
		initialDisplayCount: 6,
	},
};

export const MidnightBackground: Story = {
	args: {
		backgroundColor: 'midnight',
		header: {
			title: 'Candidates',
			copy: 'Browse independent candidates running for office.',
			layout: 'left',
		},
		candidates: mockCandidates,
		hasFilters: false,
		optionalButton: {
			...primaryButton,
			label: 'Become a Candidate',
			href: '/run',
		},
	},
};

export const LargeCandidateList: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'All Candidates',
			title: 'Independent Candidates',
			copy: 'Explore a diverse group of candidates who are committed to serving their communities.',
			layout: 'left',
		},
		candidates: [...mockCandidates, ...mockCandidates, ...mockCandidates],
		enablePagination: true,
		initialDisplayCount: 6,
	},
};

export const HeaderLayoutLeft: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Header Layout',
			title: 'Left Aligned Header',
			copy: 'This header is aligned to the left, which is now the default layout.',
			layout: 'left',
		},
		candidates: mockCandidates,
	},
};

export const HeaderLayoutCenter: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Header Layout',
			title: 'Center Aligned Header',
			copy: 'This header is centered, demonstrating the center layout option.',
			layout: 'center',
		},
		candidates: mockCandidates,
	},
};

export const HeaderLayoutRight: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Header Layout',
			title: 'Right Aligned Header',
			copy: 'This header is aligned to the right, demonstrating the right layout option.',
			layout: 'right',
		},
		candidates: mockCandidates,
	},
};
