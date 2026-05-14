import type { Meta, StoryObj } from '@storybook/react';
import { shortCopy } from './_data/content.tsx';
import { primaryButton } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { ImageTwoColumnCopyBlock } from './ImageTwoColumnCopyBlock.tsx';

const meta: Meta<typeof ImageTwoColumnCopyBlock> = {
	title: 'Page Sections/Image Two Column Copy Block',
	component: ImageTwoColumnCopyBlock,
	render: args => <ImageTwoColumnCopyBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		label: 'Our company',
		title: 'Bold research to unlock small molecule discovery for human health and aging.',
		copy1: shortCopy(),
		copy2: shortCopy(),
		image: imageJpg(),
		primaryButton: primaryButton,
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Cream: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
};

export const Midnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRight: Story = {
	args: {
		...Default.args,
		mediaAlignment: 'right',
	},
	parameters: {
		...Default.parameters,
	},
};

export const NoButton: Story = {
	args: {
		...Default.args,
		primaryButton: undefined,
	},
	parameters: {
		...Default.parameters,
	},
};
