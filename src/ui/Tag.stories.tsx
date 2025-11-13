import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag.tsx';

const meta: Meta<typeof Tag> = {
	title: 'Molecules/Tag',
	component: Tag,
	render: args => <Tag {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ContentCream: Story = {
	args: {
		name: 'Test Topic',
		href: '/test-topic',
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
