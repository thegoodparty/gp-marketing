import type { Meta, StoryObj } from '@storybook/react';

import { StepperBlock } from './StepperBlock.tsx';
import { resolveTextSize } from './_lib/resolveTextSize.ts';
import { imageJpg } from './_data/media.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof StepperBlock> = {
	title: 'Page Sections/Stepper Block',
	component: StepperBlock,
	render: args => <StepperBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const item = {
	image: imageJpg(),
	label: 'Overline',
	title: 'Headline',
	caption: 'Caption',
	copy: 'Body copy',
	buttons: buttons(),
	textSize: resolveTextSize('Medium'),
};

const itemWithIconSection = {
	...item,
	caption: undefined,
	iconItems: [
		{ icon: 'heart', iconBg: 'blue' as const, subhead: 'Subhead', body: 'Body copy' },
		{ icon: 'shield', iconBg: 'lavender' as const, subhead: 'Subhead', body: 'Body copy' },
		{ icon: 'star', iconBg: 'halo-green' as const, subhead: 'Subhead', body: 'Body copy' },
	],
};

const itemMediaRight = { ...item, layout: 'media-right' as const };

export const Default: Story = {
	args: {
		header: {
			label: 'Overline',
			title: 'Headline',
			caption: 'Caption',
			buttons: buttons(),
		},
		items: [item, item],
	},
};

export const MediaRight: Story = {
	args: {
		...Default.args,
		items: [itemMediaRight, itemMediaRight],
	},
};

export const BgMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const IconSection: Story = {
	name: 'Icon Section ⭐',
	args: {
		header: {
			label: 'Overline',
			title: 'Headline',
			buttons: buttons(),
		},
		items: [itemWithIconSection],
	},
};
