import type { Meta, StoryObj } from '@storybook/react';
import { GlossaryHero } from './GlossaryHero.tsx';

const meta: Meta<typeof GlossaryHero> = {
	title: 'Components/Glossary Hero',
	component: GlossaryHero,
	render: args => <GlossaryHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Headline',
		copy: 'Body copy',
		navigation: [
			{ _id: '1', title: 'A', href: '/' },
			{ _id: '2', title: 'B', href: '#' },
			{ _id: '3', title: 'C', href: '#' },
			{ _id: '4', title: 'D', href: '#' },
			{ _id: '5', title: 'E', href: '#' },
			{ _id: '6', title: 'F', href: '#' },
			{ _id: '7', title: 'G', href: '#' },
			{ _id: '8', title: 'H', href: '#' },
			{ _id: '9', title: 'I', href: '#' },
			{ _id: '10', title: 'J', href: '#' },
		],
		searchTerms: [
			{ _id: '1', title: 'Glossary Term 1', href: '/' },
			{ _id: '2', title: 'Glossary Term 2', href: '/' },
			{ _id: '3', title: 'Glossary Term 3', href: '/' },
			{ _id: '4', title: 'Glossary Term 4', href: '/' },
			{ _id: '5', title: 'Glossary Term 5', href: '/' },
			{ _id: '6', title: 'Glossary Term 6', href: '/' },
			{ _id: '7', title: 'Glossary Term 7', href: '/' },
			{ _id: '8', title: 'Glossary Term 8', href: '/' },
			{ _id: '9', title: 'Glossary Term 9', href: '/' },
			{ _id: '10', title: 'Glossary Term 10', href: '/' },
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
