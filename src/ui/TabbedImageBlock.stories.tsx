import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { TabbedImageBlock } from './TabbedImageBlock.tsx';
import { imageJpg } from '~/ui/_data/media.tsx';

const meta: Meta<typeof TabbedImageBlock> = {
	title: 'Page Sections/Tabbed Image Block',
	component: TabbedImageBlock,
	render: args => <TabbedImageBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultParams = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			buttons: buttons(),
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

const item = {
	title: 'Subhead',
	copy: 'Body copy',
	image: imageJpg(),
	button: buttons()[0],
};

export const ContentCream: Story = {
	args: {
		...defaultParams.args,
		items: Array(4).fill(item),
		backgroundColor: 'cream',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const ContentMidnight: Story = {
	args: {
		...defaultParams.args,
		items: Array(4).fill(item),
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParams.parameters,
	},
};
