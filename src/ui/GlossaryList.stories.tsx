import type { Meta, StoryObj } from '@storybook/react';
import { GlossaryList } from './GlossaryList.tsx';

const meta: Meta<typeof GlossaryList> = {
	title: 'Components/Glossary List',
	component: GlossaryList,
	render: args => <GlossaryList {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		items: [
			{
				title: 'Glossary Term 1',
				copy: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
				href: '/',
			},
			{
				title: 'Glossary Term 2',
				copy: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
				href: '/',
			},
			{
				title: 'Glossary Term 3',
				copy: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
				href: '/',
			},
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
