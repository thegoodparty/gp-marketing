import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { BlogCard } from './BlogCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof BlogCard> = {
	title: 'Molecules/Blog Card',
	component: BlogCard,
	render: args => (
		<Container size='xs'>
			<BlogCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Label',
		title: 'This is a test title to be used for a card preview',
		href: '/',
		image: imageJpg(),
		author: {
			name: 'Test Person',
			meta: ['Test Title'],
			image: imageJpg(),
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
