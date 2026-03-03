import type { Meta, StoryObj } from '@storybook/react';

import { buttons, primaryButton } from './_data/content.tsx';

import { PricingBlock } from './PricingBlock.tsx';

const meta: Meta<typeof PricingBlock> = {
	title: 'Page Sections/Pricing Block',
	component: PricingBlock,
	render: args => <PricingBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const pricing = {
	name: 'Subhead',
	price: '$XX',
	billingPeriod: 'per month',
	listTitle: 'List item context:',
	list: ['List item 1', 'List item 2', 'List item 3', 'List item 4', 'List item 5', 'List item 6'],
	button: primaryButton,
};

export const Default: Story = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			caption: '*A compelling caption goes here',
			buttons: buttons(),
		},
		items: [
			{ ...pricing, color: 'midnight' },
			{ ...pricing, color: 'lavender' },
			{ ...pricing, color: 'bright-yellow' },
		],
	},
};
