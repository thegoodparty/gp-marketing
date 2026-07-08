import type { Meta, StoryObj } from '@storybook/react';
import { formatSidebarLinkLabel, inferSidebarLinkIcon } from '~/lib/electionsHelpers';
import { ElectionsSidebar } from './ElectionsSidebar.tsx';

function toSidebarLink(href: string, index: number) {
	return {
		label: formatSidebarLinkLabel(href, index),
		icon: inferSidebarLinkIcon(href),
		href,
	};
}

const defaultLinks = [
	toSidebarLink('https://www.linkedin.com/in/jane-candidate', 0),
	toSidebarLink('https://www.facebook.com/jane', 1),
	toSidebarLink('mailto:hello@example.com', 2),
];

const meta: Meta<typeof ElectionsSidebar> = {
	title: 'New Components/Components/Elections Sidebar',
	component: ElectionsSidebar,
	render: args => <ElectionsSidebar {...args} />,
	decorators: [
		Story => (
			<div className='max-w-xs'>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		links: defaultLinks,
		aboutOffice: 'Body text here',
		termLength: 'Body text here',
		electionDate: 'Body text here',
		cta: {
			buttonType: 'button',
			label: 'Primary CTA',
		},
	},
};

export const WithLinksOnly: Story = {
	args: {
		links: defaultLinks,
	},
};

export const WithInfoOnly: Story = {
	args: {
		aboutOffice: 'Body text here',
		termLength: 'Body text here',
		electionDate: 'Body text here',
		cta: {
			buttonType: 'button',
			label: 'Primary CTA',
		},
	},
};

export const Minimal: Story = {
	args: {
		links: [toSidebarLink('https://www.janeforoffice.com', 0)],
		aboutOffice: 'Body text here',
	},
};

export const WithoutCTA: Story = {
	args: {
		links: defaultLinks,
		aboutOffice: 'Body text here',
		termLength: 'Body text here',
		electionDate: 'Body text here',
	},
};

/** Mirrors candidate profiles with multiple custom-domain links (hostname labels). */
export const MultipleWebsites: Story = {
	args: {
		links: [
			toSidebarLink('https://www.facebook.com/voteclaudiakauffman/', 0),
			toSidebarLink('https://www.linkedin.com/in/claudia-kauffman-5367762a/', 1),
			toSidebarLink('https://senatedemocrats.wa.gov/kauffman/', 2),
			toSidebarLink('https://www.voteclaudiakauffman.com/', 3),
		],
		aboutOffice: 'Washington State Senate, District 47',
		termLength: '4 Years',
		electionDate: 'November 5, 2024',
	},
};

/** Social platforms at any array position, including LinkedIn first. */
export const SocialPlatforms: Story = {
	args: {
		links: [
			toSidebarLink('https://www.linkedin.com/in/dr-tracey-stallworth-25144aa0/', 0),
			toSidebarLink('https://www.instagram.com/dr.traceystallworth/', 1),
			toSidebarLink('https://en.wikipedia.org/wiki/Example', 2),
			toSidebarLink('https://www.youtube.com/@candidate', 3),
			toSidebarLink('https://www.tiktok.com/@candidate', 4),
		],
	},
};
