import type { Meta, StoryObj } from '@storybook/react';
import { BlogArticleHero } from './BlogArticleHero.tsx';
import { imageJpg } from '~/ui/_data/media.tsx';

const meta: Meta<typeof BlogArticleHero> = {
	title: 'Components/Blog Article Hero',
	component: BlogArticleHero,
	render: args => <BlogArticleHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Headline',
		author: {
			name: 'John Doe',
			image: imageJpg(),
			meta: ['Test Title'],
		},
		tagline: 'Tagline',
		image: imageJpg(),
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
