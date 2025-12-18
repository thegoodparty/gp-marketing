import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { TestimonialCard } from './TestimonialCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof TestimonialCard> = {
	title: 'Molecules/TestimonialCard',
	component: TestimonialCard,
	render: args => (
		<Container size='xs'>
			<TestimonialCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		copy: (
			<p>
				But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a
				complete account of the system, and expound the actual teachings of the great explorer of the truth.
			</p>
		),
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
