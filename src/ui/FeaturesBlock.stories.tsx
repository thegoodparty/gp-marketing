import type { Meta, StoryObj } from '@storybook/react';

import { FeaturesBlock } from './FeaturesBlock.tsx';
import { RichData } from './RichData.tsx';

import { buttons, primaryButton } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';

const meta: Meta<typeof FeaturesBlock> = {
	title: 'Page Sections/Features Block',
	component: FeaturesBlock,
	render: args => <FeaturesBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const highlightedFeature = {
	icon: 'circle',
	title: 'This is a test title',
	description: <RichData value='This is a description' />,
	isHighlighted: true,
	image: imageJpg(),
	button: primaryButton,
};

const feature = {
	icon: 'circle',
	title: 'This is a test title',
	description: <RichData value='This is a description' />,
	button: primaryButton,
};

export const Default: Story = {
	args: {
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
			buttons: buttons(),
		},
		items: [feature, feature, feature, feature, feature, feature],
	},
};

export const IconBgRed: Story = {
	args: {
		...Default.args,
		iconBg: 'red',
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const HighlightedFeatureLeft: Story = {
	args: {
		...Default.args,
		items: [feature, feature, feature, feature, feature, highlightedFeature],
	},
};

export const HighlightedFeatureRight: Story = {
	args: {
		...Default.args,
		items: [feature, feature, feature, feature, feature, highlightedFeature],

		highlightedFeatureAlignment: 'right',
	},
};
