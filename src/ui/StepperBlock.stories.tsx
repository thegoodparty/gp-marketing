import type { Meta, StoryObj } from '@storybook/react';

import { StepperBlock } from './StepperBlock.tsx';
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
