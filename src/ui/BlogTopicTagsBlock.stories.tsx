import type { Meta, StoryObj } from '@storybook/react';
import { BlogTopicTagsBlock } from './BlogTopicTagsBlock.tsx';

const meta: Meta<typeof BlogTopicTagsBlock> = {
	title: 'Page Sections/Blog Topic Tags Block',
	component: BlogTopicTagsBlock,
	render: args => <BlogTopicTagsBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ContentCream: Story = {
	args: {
		topics: [
			{
				name: 'Test Topic',
				href: '/test-topic',
			},
			{
				name: 'Test Topic 2',
				href: '/test-topic-2',
			},
			{
				name: 'Test Topic 3',
				href: '/test-topic-3',
			},
			{
				name: 'Test Topic 4',
				href: '/test-topic-4',
			},
			{
				name: 'Test Topic 5',
				href: '/test-topic-5',
			},
			{
				name: 'Test Topic 6',
				href: '/test-topic-6',
			},
			{
				name: 'Test Topic 7',
				href: '/test-topic-7',
			},
			{
				name: 'Test Topic 8',
				href: '/test-topic-8',
			},
			{
				name: 'Test Topic 9',
				href: '/test-topic-9',
			},
			{
				name: 'Test Topic 10',
				href: '/test-topic-10',
			},
			{
				name: 'Test Topic 11',
				href: '/test-topic-11',
			},
			{
				name: 'Test Topic 12',
				href: '/test-topic-12',
			},
			{
				name: 'Test Topic 13',
				href: '/test-topic-13',
			},
			{
				name: 'Test Topic 14',
				href: '/test-topic-14',
			},
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
