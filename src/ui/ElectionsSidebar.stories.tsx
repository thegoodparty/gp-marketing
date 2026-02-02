import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsSidebar } from './ElectionsSidebar.tsx';

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
		links: [
			{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
			{ label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
			{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
		],
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
		links: [
			{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
			{ label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
			{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
		],
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
		links: [{ label: 'Website', icon: 'globe', href: 'https://www.website.com' }],
		aboutOffice: 'Body text here',
	},
};

export const WithoutCTA: Story = {
	args: {
		links: [
			{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
			{ label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
			{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
		],
		aboutOffice: 'Body text here',
		termLength: 'Body text here',
		electionDate: 'Body text here',
	},
};
