import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { TwoUpCardBlock } from './TwoUpCardBlock.tsx';

const meta: Meta<typeof TwoUpCardBlock> = {
	title: 'Page Sections/Two Up Card Block',
	component: TwoUpCardBlock,
	render: args => <TwoUpCardBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const valueProp = {
	title: 'Headline goes here across two lines',
	list: [
		{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
		{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
		{ title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: 'hand-heart' },
	],
	button: primaryButton,
};

const testimonial = {
	copy: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth.',
	author: {
		name: 'Test Person',
		meta: ['Test Title'],
		image: imageJpg(),
	},
};

const image = {
	image: imageJpg(),
};

const Default = {
	args: {},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const ValuePropCream: Story = {
	args: {
		...Default.args,
		card1: { ...valueProp, color: 'red', type: 'value-prop' },
		card2: { ...valueProp, color: 'blue', type: 'value-prop' },
	},
	parameters: {
		...Default.parameters,
	},
};

export const ValuePropMidnight: Story = {
	args: {
		...Default.args,
		card1: { ...valueProp, color: 'red', type: 'value-prop' },
		card2: { ...valueProp, color: 'blue', type: 'value-prop' },
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const TestimonialCream: Story = {
	args: {
		...Default.args,
		card1: { ...testimonial, type: 'testimonial' },
		card2: { ...testimonial, type: 'testimonial' },
	},
};

export const TestimonialMidnight: Story = {
	args: {
		...Default.args,
		card1: { ...testimonial, type: 'testimonial' },
		card2: { ...testimonial, type: 'testimonial' },
		backgroundColor: 'midnight',
	},
};

export const ImageCream: Story = {
	args: {
		...Default.args,
		card1: { ...image, type: 'image' },
		card2: { ...image, type: 'image' },
	},
};

export const ImageMidnight: Story = {
	args: {
		...Default.args,
		card1: { ...image, type: 'image' },
		card2: { ...image, type: 'image' },
		backgroundColor: 'midnight',
	},
};
