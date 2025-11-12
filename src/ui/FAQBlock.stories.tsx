import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { FAQBlock } from './FAQBlock.tsx';

const meta: Meta<typeof FAQBlock> = {
	title: 'Page Sections/FAQBlock',
	component: FAQBlock,
	render: args => <FAQBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			buttons: buttons(),
		},
		items: [
			{
				title: 'Item 1',
				copy: (<p>Lorem ipsum dolor sit amet consect adipiscing elit non tellus eleifend auctor imper amet quam amet sem</p>) as any,
			},
			{
				title: 'Item 2',
				copy: (<p>Lorem ipsum dolor sit amet consect adipiscing elit non tellus eleifend auctor imper amet quam amet sem</p>) as any,
			},
		],
	},
};

export const BgMidnight: Story = {
	args: {
		...Default.args,
		label: 'Test label',
		title: 'This is a test title',
		copy: 'This is a test of the summary description',
		buttons: buttons(),
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};
