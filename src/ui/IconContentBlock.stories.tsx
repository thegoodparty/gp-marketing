import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { IconContentBlock } from './IconContentBlock.tsx';
import { RichData } from '~/ui/RichData.tsx';

const meta: Meta<typeof IconContentBlock> = {
	title: 'Page Sections/Icon Content Block',
	component: IconContentBlock,
	render: args => <IconContentBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultParams = {
	args: {
		columns: '3' as const,
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

const defaultParamsNoCta = {
	args: {
		columns: '3' as const,
		header: {
			label: 'Test label',
			title: 'This is a test title',
			copy: 'This is a test of the summary description',
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
	title: 'Headline',
	copy: (
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
							text: 'Body copy lorem ipsum dolor sit amet, ',
						},
						{
							_key: 'f9cf2b8348e5',
							_type: 'span',
							marks: ['78bdbff3f145'],
							text: 'consectetur',
						},
						{
							_key: '675e7534783c',
							_type: 'span',
							marks: [],
							text: ' adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
						},
					],
					markDefs: [
						{
							_key: '78bdbff3f145',
							_type: 'inlineExternalLink',
							field_externalLink: 'https://evensix.com',
						},
					],
					style: 'normal',
				},
			]}
		/>
	),
	icon: 'hand-heart',
};

export const ContentCream: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'mixed',
		backgroundColor: 'cream',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const ContentCreamNoCta: Story = {
	args: {
		...defaultParamsNoCta.args,
		items: Array(10).fill(item),
		color: 'mixed',
		backgroundColor: 'cream',
	},
	parameters: {
		...defaultParamsNoCta.parameters,
	},
};

export const ContentMidnight: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'mixed',
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const ContentMidnightNoCta: Story = {
	args: {
		...defaultParamsNoCta.args,
		items: Array(10).fill(item),
		color: 'mixed',
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParamsNoCta.parameters,
	},
};

export const Red: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'red',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'waxflower',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'bright-yellow',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'halo-green',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Blue: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'blue',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'lavender',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Mixed: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'mixed',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const White: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		color: 'white',
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParams.parameters,
	},
};
