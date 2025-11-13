import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { TeamCard } from './TeamCard.tsx';
import { Container } from './Container.tsx';

const meta: Meta<typeof TeamCard> = {
	title: 'Molecules/Team Card',
	component: TeamCard,
	render: args => (
		<Container size='xs'>
			<TeamCard {...args} />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
	args: {
		label: 'Job title',
		title: 'Name Surname',
		href: '/',
		image: imageJpg(),
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
