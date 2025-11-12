import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { Carousel } from './Carousel.tsx';

const meta: Meta<typeof Carousel> = {
	title: 'Page Sections/Carousel',
	component: Carousel,
	render: args => <Carousel {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const card = {
	copy: 'GoodParty.org gave me the tools and confidence to run and win.',
	author: {
		name: 'Test Person',
		meta: ['Test Title'],
		image: imageJpg(),
	},
};

const DefaultProps = {
	args: {
		header: {
			title: 'Test Title',
			label: 'Test Label',
			caption: 'Test Caption',
			copy: 'Test Copy',
			buttons: buttons(),
			layout: 'left' as const,
		},
		cards: [card, card, card, card, card],
		backgroundColor: 'cream' as const,
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Default: Story = {
	args: {
		...DefaultProps.args,
	},
	parameters: {
		...DefaultProps.parameters,
	},
};

export const Midnight: Story = {
	args: {
		...DefaultProps.args,
		backgroundColor: 'midnight' as const,
	},
	parameters: {
		...DefaultProps.parameters,
	},
};
