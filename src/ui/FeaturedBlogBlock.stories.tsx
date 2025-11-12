import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { FeaturedBlogBlock } from './FeaturedBlogBlock.tsx';

const meta: Meta<typeof FeaturedBlogBlock> = {
	title: 'Page Sections/Featured Blog Block',
	component: FeaturedBlogBlock,
	render: args => <FeaturedBlogBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Test label',
		title: 'This is a test title',
		copy: 'This is a test of the summary description',
		buttons: buttons(),
		caption: 'Caption goes here',
		image: imageJpg(),
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
