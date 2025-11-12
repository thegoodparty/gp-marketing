import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { Author } from './Author.tsx';

const meta: Meta<typeof Author> = {
	title: 'Molecules/Author',
	component: Author,
	render: args => <Author {...args} />,
};

export default meta;

type Story = StoryObj<typeof Author>;

export const Default: Story = {
	args: {
		image: imageJpg(),
		name: 'Name Surname',
		meta: ['Meta 1', 'Meta 2'],
	},
};
