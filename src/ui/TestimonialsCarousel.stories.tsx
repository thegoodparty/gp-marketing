import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { TestimonialsCarousel } from './TestimonialsCarousel.tsx';

const meta: Meta<typeof TestimonialsCarousel> = {
	title: 'New Components/Page Sections/Testimonials Carousel',
	component: TestimonialsCarousel,
	render: args => <TestimonialsCarousel {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const card = {
	copy: (
		<p>
			GoodParty.org gave me the tools and confidence to run and win. I would recommend this to anyone who wants to make a difference in
			their community.
		</p>
	),
	author: {
		name: 'Test Person',
		meta: ['City Council Member'],
		image: imageJpg(),
	},
};

const DefaultProps = {
	args: {
		header: {
			title: 'What people are saying',
			label: 'Testimonials',
			caption: 'Real stories',
			copy: 'Hear from candidates and volunteers who used GoodParty to run and win.',
			buttons: buttons(),
			layout: 'left' as const,
		},
		cards: [card, card, card, card, card],
		backgroundColor: 'cream' as const,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=26228-15372',
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
