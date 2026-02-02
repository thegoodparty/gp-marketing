import type { Meta, StoryObj } from '@storybook/react';
import { GoodPartyOrgPledge } from './GoodPartyOrgPledge.tsx';
import { RichData } from './RichData.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof GoodPartyOrgPledge> = {
	title: 'New Components/Page Sections/GoodParty.org Pledge',
	component: GoodPartyOrgPledge,
	render: args => <GoodPartyOrgPledge {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const pledgeCard = {
	icon: 'heart',
	title: 'People-Powered',
	content: (
		<RichData
			value={[
				{
					_key: 'c93fed7fd2a4',
					_type: 'block',
					children: [
						{
							_key: '2f26752b6999',
							_type: 'span',
							marks: [],
							text: 'We reject corporate PAC money and put people first in our campaigns and governance.',
						},
					],
					markDefs: [],
					style: 'normal',
				},
			]}
		/>
	),
	button: {
		buttonType: 'button' as const,
		label: 'Button',
	},
};

const defaultArgs = {
	header: {
		title: 'GoodParty.org Pledge',
		copy: 'Our commitment to democracy and transparent governance',
	},
	pledgeCards: [
		{
			...pledgeCard,
			icon: 'heart',
			title: 'People-Powered',
		},
		{
			...pledgeCard,
			icon: 'shield',
			title: 'Accountable',
		},
		{
			...pledgeCard,
			icon: 'users',
			title: 'Transparent',
		},
		{
			...pledgeCard,
			icon: 'star',
			title: 'Independent',
		},
	],
};

export const Default: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23714-25633&t=Y3gXgfteJfMmhQjG-0',
		},
	},
};

export const Cream: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'cream',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23714-25633&t=Y3gXgfteJfMmhQjG-0',
		},
	},
};

export const WithHeaderButtons: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
		header: {
			...defaultArgs.header,
			buttons: buttons(),
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23714-25633&t=Y3gXgfteJfMmhQjG-0',
		},
	},
};

export const RedIcons: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
		iconBg: 'red',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23714-25633&t=Y3gXgfteJfMmhQjG-0',
		},
	},
};
