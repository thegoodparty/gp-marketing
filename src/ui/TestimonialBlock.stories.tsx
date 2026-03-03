import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { TestimonialBlock } from './TestimonialBlock.tsx';

const meta: Meta<typeof TestimonialBlock> = {
	title: 'Page Sections/Testimonial Block',
	component: TestimonialBlock,
	render: args => <TestimonialBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const testimonial = {
	copy: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth.',
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
		items: [
			{ ...testimonial, color: 'halo-green' as const },
			{ ...testimonial, color: 'lavender' as const },
			{ ...testimonial, color: 'bright-yellow' as const },
			{ ...testimonial, color: 'blue' as const },
			{ ...testimonial, color: 'waxflower' as const },
		],
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};
