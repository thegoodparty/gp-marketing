import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { TestimonialImageCard } from './TestimonialImageCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof TestimonialImageCard> = {
	title: 'Molecules/Testimonial Image Card',
	component: TestimonialImageCard,
	render: args => (
		<Container size='xs'>
			<TestimonialImageCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		copy: 'GoodParty.org gave me the tools and confidence to run and win.',
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

export const Red: Story = {
	args: {
		...Default.args,
		color: 'red',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...Default.args,
		color: 'waxflower',
	},
	parameters: {
		...Default.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...Default.args,
		color: 'bright-yellow',
	},
	parameters: {
		...Default.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...Default.args,
		color: 'halo-green',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Blue: Story = {
	args: {
		...Default.args,
		color: 'blue',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...Default.args,
		color: 'lavender',
	},
	parameters: {
		...Default.parameters,
	},
};
