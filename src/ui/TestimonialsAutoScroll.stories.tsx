import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { TestimonialsAutoScroll } from './TestimonialsAutoScroll.tsx';

const meta: Meta<typeof TestimonialsAutoScroll> = {
	title: 'New Components/Page Sections/Testimonials Auto Scroll',
	component: TestimonialsAutoScroll,
	render: args => <TestimonialsAutoScroll {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const card = {
	copy: (
		<p>
			GoodParty.org gave me the tools and confidence to run and win. I would recommend this to anyone who wants to make a
			difference in their community.
		</p>
	),
	author: {
		name: 'Test Person',
		meta: ['City Council Member'],
		image: imageJpg(),
	},
};

const cards = [
	card,
	{
		copy: <p>Running as an independent felt impossible until GoodParty showed me the path. We flipped our local school board.</p>,
		author: { name: 'Jane Smith', meta: ['School Board Member'] },
	},
	{
		copy: <p>The support from the GoodParty community was incredible. I never felt alone in my campaign.</p>,
		author: { name: 'Marcus Lee', meta: ['Town Supervisor'] },
	},
	{
		copy: <p>From zero political experience to city council in eight months. GoodParty made it real.</p>,
		author: { name: 'Priya Patel', meta: ['City Council Member'], image: imageJpg() },
	},
	{
		copy: <p>I had the passion. GoodParty gave me the playbook. Now I represent my neighborhood.</p>,
		author: { name: 'David Torres', meta: ['District Representative'] },
	},
];

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
		cards,
		backgroundColor: 'cream' as const,
	},
};

export const Default: Story = {
	args: { ...DefaultProps.args },
};

export const Midnight: Story = {
	args: {
		...DefaultProps.args,
		backgroundColor: 'midnight' as const,
	},
};

export const White: Story = {
	args: {
		...DefaultProps.args,
		backgroundColor: 'white' as const,
	},
};

export const NoHeader: Story = {
	args: {
		cards,
		backgroundColor: 'cream' as const,
	},
};

export const Fast: Story = {
	args: {
		...DefaultProps.args,
		speedMultiplier: 2,
	},
};
