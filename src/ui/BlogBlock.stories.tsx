import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { BlogBlock } from './BlogBlock.tsx';

const meta: Meta<typeof BlogBlock> = {
	title: 'Page Sections/Blog Block',
	component: BlogBlock,
	render: args => <BlogBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const blog = {
	label: 'Label',
	title: 'This is a test title to be used for a card preview',
	href: '/',
	image: imageJpg(),
	author: {
		name: 'Test Person',
		meta: ['Test Title'],
		image: imageJpg(),
	},
};

export const Default: Story = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			buttons: buttons(),
		},
		items: [blog, blog, blog, blog, blog, blog, blog, blog, blog, blog, blog, blog],
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
