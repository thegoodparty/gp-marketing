import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { TestimonialBlockWithLink } from './TestimonialBlockWithLink.tsx';

const meta: Meta<typeof TestimonialBlockWithLink> = {
	title: 'New Components/Page Sections/Testimonial Block With Link',
	component: TestimonialBlockWithLink,
	render: args => <TestimonialBlockWithLink {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const storyLink = {
	buttonType: 'internal' as const,
	href: '/blog/article/example-case-study',
	label: 'Read the story',
};

const cards = [
	{
		author: { name: 'Joseph Faulkner', meta: ['Alderman, Fayetteville, TN'], image: imageJpg() },
		copy: "The good thing about being an independent is you're not shackled by different notions of what a specific party would do.",
		result: 'An independent newcomer who beat two incumbents',
		link: storyLink,
	},
	{
		author: { name: 'Japjeet Uppal', meta: ['City Council, Livingston, CA'], image: imageJpg() },
		copy: "If we get people that are willing to take action, then you don't have to change the world; even just to make small changes in the community around you, things can improve.",
		result: 'Won with 67.2% of the vote in a three-way race',
		link: storyLink,
	},
	{
		author: { name: 'Test Person', meta: ['School Board, Springfield, IL'], image: imageJpg() },
		copy: 'I signed up ten days out from the filing deadline. Without GoodParty.org I would not have made the ballot.',
		result: 'Filed with ten days to spare',
		link: storyLink,
	},
	{
		author: { name: 'Another Person', meta: ['Mayor, Riverside, OR'], image: imageJpg() },
		copy: 'Running without a party meant every conversation was with a neighbour, not a donor.',
		result: 'Raised no corporate money',
		link: storyLink,
	},
];

const DefaultProps = {
	args: {
		header: {
			title: 'Independents are winning close to home.',
			copy: 'Independent and nonpartisan candidates are winning elections in Tennessee and across the country.',
			layout: 'left' as const,
		},
		cards,
		backgroundColor: 'cream' as const,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=3123-14419',
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

export const WithoutResultOrLink: Story = {
	args: {
		...DefaultProps.args,
		cards: cards.map(card => ({ ...card, result: undefined, link: undefined })),
	},
	parameters: {
		...DefaultProps.parameters,
	},
};
