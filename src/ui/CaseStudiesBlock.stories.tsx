import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { CaseStudiesBlock } from './CaseStudiesBlock.tsx';

const meta: Meta<typeof CaseStudiesBlock> = {
	title: 'Page Sections/Case Studies Block',
	component: CaseStudiesBlock,
	render: args => <CaseStudiesBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const caseStudy = {
	label: 'News',
	title: 'How GoodParty.org Helped Power a Historic Win in Rock Hill, SC',
	href: '/case-studies/example',
	image: imageJpg(),
	author: {
		name: 'Emily Bruhl',
		meta: ['Dec 06, 2025'],
		image: imageJpg(),
	},
};

export const Default: Story = {
	args: {
		items: [caseStudy, caseStudy, caseStudy, caseStudy, caseStudy, caseStudy],
	},
};

export const WithHeader: Story = {
	args: {
		header: {
			label: 'Case Studies',
			title: 'Real Independent success stories',
			copy: 'See how Independents are winning with people-powered campaigns.',
			buttons: buttons(),
		},
		items: [caseStudy, caseStudy, caseStudy, caseStudy, caseStudy, caseStudy],
	},
};

export const WithSeeMore: Story = {
	args: {
		items: [caseStudy, caseStudy, caseStudy, caseStudy, caseStudy, caseStudy],
		showSeeMoreButton: true,
		allItemsCount: 12,
	},
};

export const Empty: Story = {
	args: {
		items: [],
	},
};
