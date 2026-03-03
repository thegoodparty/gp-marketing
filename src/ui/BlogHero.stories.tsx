import type { Meta, StoryObj } from '@storybook/react';
import { BlogHero } from './BlogHero.tsx';

const meta: Meta<typeof BlogHero> = {
	title: 'Components/Blog Hero',
	component: BlogHero,
	render: args => <BlogHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Headline',
		copy: 'Body copy',
		categories: [
			{ _id: '1', title: 'Category 1', href: '#' },
			{ _id: '2', title: 'Category 2', href: '/' },
			{ _id: '3', title: 'Category 3', href: '#' },
		],
		articles: [
			{ _id: '1', title: 'Article 1', href: '/' },
			{ _id: '2', title: 'Article 2', href: '/' },
			{ _id: '3', title: 'Article 3', href: '/' },
			{ _id: '4', title: 'Article 4', href: '/' },
			{ _id: '5', title: 'Article 5', href: '/' },
			{ _id: '6', title: 'Article 6', href: '/' },
			{ _id: '7', title: 'Article 7', href: '/' },
			{ _id: '8', title: 'Article 8', href: '/' },
			{ _id: '9', title: 'Article 9', href: '/' },
			{ _id: '10', title: 'Article 10', href: '/' },
		],
		backgroundColor: 'cream',
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
