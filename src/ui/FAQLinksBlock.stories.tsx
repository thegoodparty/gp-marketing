import type { Meta, StoryObj } from '@storybook/react';
import { FAQLinksBlock, type FAQLinkItem } from './FAQLinksBlock.tsx';

const meta: Meta<typeof FAQLinksBlock> = {
	title: 'New Components/Page Sections/FAQ Links Block',
	component: FAQLinksBlock,
	render: args => <FAQLinksBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample FAQ link data matching the design
const sampleLinks: FAQLinkItem[] = [
	{
		id: '1',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/1',
	},
	{
		id: '2',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/2',
	},
	{
		id: '3',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/3',
	},
	{
		id: '4',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/4',
	},
	{
		id: '5',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/5',
	},
	{
		id: '6',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/6',
	},
	{
		id: '7',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/7',
	},
	{
		id: '8',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/8',
	},
	{
		id: '9',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/9',
	},
	{
		id: '10',
		label: 'A frequently asked question link goes right here?',
		href: '/faq/10',
	},
];

// Varied FAQ links with different content
const variedLinks: FAQLinkItem[] = [
	{
		id: '1',
		label: 'How do I register to vote?',
		href: '/faq/voter-registration',
	},
	{
		id: '2',
		label: 'What documents do I need to vote?',
		href: '/faq/voting-documents',
	},
	{
		id: '3',
		label: 'Can I vote by mail?',
		href: '/faq/mail-in-voting',
	},
	{
		id: '4',
		label: 'How do I find my polling place?',
		href: '/faq/polling-place',
	},
	{
		id: '5',
		label: 'What are the voting hours?',
		href: '/faq/voting-hours',
	},
	{
		id: '6',
		label: 'How do I update my voter registration?',
		href: '/faq/update-registration',
	},
];

export const Default: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: sampleLinks,
		backgroundColor: 'cream',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24696-15096&m=dev',
		},
	},
};

export const MidnightBackground: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: sampleLinks,
		backgroundColor: 'midnight',
	},
};

export const WithHeader: Story = {
	args: {
		header: {
			title: 'Frequently Asked Questions',
			copy: 'Find answers to common questions about voting, elections, and our platform.',
		},
		items: variedLinks,
		backgroundColor: 'cream',
	},
};

export const WithoutHeader: Story = {
	args: {
		items: sampleLinks,
		backgroundColor: 'cream',
	},
};

export const EmptyState: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: [],
		backgroundColor: 'cream',
	},
};

export const SingleItem: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: [sampleLinks[0]],
		backgroundColor: 'cream',
	},
};

export const ManyItems: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: Array.from({ length: 15 }, (_, i) => ({
			id: `faq-${i + 1}`,
			label: `FAQ Question ${i + 1}: A frequently asked question link goes right here?`,
			href: `/faq/${i + 1}`,
		})),
		backgroundColor: 'cream',
	},
};

export const WithoutLinks: Story = {
	args: {
		header: {
			title: 'Headline',
			copy: 'Body copy',
		},
		items: sampleLinks.map(link => ({ ...link, href: undefined })),
		backgroundColor: 'cream',
	},
};

export const VariedContent: Story = {
	args: {
		header: {
			title: 'Common Questions',
			copy: 'Browse our most frequently asked questions to find quick answers.',
		},
		items: variedLinks,
		backgroundColor: 'cream',
	},
};
