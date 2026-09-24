import type { Meta, StoryObj } from '@storybook/react';

import { DemoRequestBlock } from './DemoRequestBlock.tsx';

const meta: Meta<typeof DemoRequestBlock> = {
	title: 'New Components/Page Sections/Demo Request Block',
	component: DemoRequestBlock,
	render: args => <DemoRequestBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		heading: 'Running for local office? Request a demo of GoodParty.org',
		body: 'Tell us a little about your race. If a live walkthrough is the right fit, you will pick a time on the next screen. If not, we will point you to the fastest way to see the product.',
		talkingPoints: [
			{ title: 'Your race', copy: 'Who is voting, what it takes to win, and where you stand today.' },
			{
				title: 'Reaching voters',
				copy: 'The voter file for your district and five ways to reach people from one app: texting, calls, voicemail drops, door knocking, and phone banking.',
			},
			{ title: 'Your next two weeks', copy: 'What to do first, and how Campaign Success works alongside you.' },
		],
		apiEndpoint: 'https://demo-qualifier-production.up.railway.app/qualify',
	},
};

export const Midnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};
