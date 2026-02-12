import type { Meta, StoryObj } from '@storybook/react';

import { resolveTextSize } from './_lib/resolveTextSize.ts';
import { HeaderBlock } from './HeaderBlock.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof HeaderBlock> = {
	title: 'Page Sections/Header Block ⭐',
	component: HeaderBlock,
	render: args => <HeaderBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
	label: 'Section Label',
	title: 'Section Title',
	copy: 'Body copy describing the section content.',
	layout: 'center' as const,
	backgroundColor: 'cream' as const,
};

export const Default: Story = {
	args: {
		...defaultArgs,
	},
};

export const LayoutLeft: Story = {
	args: {
		...defaultArgs,
		layout: 'left',
	},
};

export const LayoutRight: Story = {
	args: {
		...defaultArgs,
		layout: 'right',
	},
};

export const Midnight: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
	},
};

export const WithButtons: Story = {
	args: {
		...defaultArgs,
		buttons: buttons(),
	},
};

export const MidnightWithButtons: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
		buttons: buttons(),
	},
};

export const WithCaption: Story = {
	args: {
		...defaultArgs,
		caption: 'Optional caption text below the buttons.',
	},
};

export const FullHeader: Story = {
	args: {
		...defaultArgs,
		buttons: buttons(),
		caption: 'Supporting caption for additional context.',
	},
};

export const Minimal: Story = {
	args: {
		title: 'Title Only',
		layout: 'center',
	},
};

export const LabelAndTitle: Story = {
	args: {
		label: 'Overline',
		title: 'Headline without body copy',
		layout: 'center',
	},
};

export const TextSizeSmall: Story = {
	args: {
		...defaultArgs,
		textSize: resolveTextSize('Small'),
	},
};

export const TextSizeLarge: Story = {
	args: {
		...defaultArgs,
		textSize: resolveTextSize('Large'),
	},
};
