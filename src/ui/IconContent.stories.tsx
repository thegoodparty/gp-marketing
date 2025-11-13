import type { Meta, StoryObj } from '@storybook/react';
import { IconContent } from './IconContent.tsx';
import { RichData } from '~/ui/RichData.tsx';

const meta: Meta<typeof IconContent> = {
	title: 'Molecules/Icon Content',
	component: IconContent,
	render: args => <IconContent {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultParams = {
	args: {
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
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Red: Story = {
	args: {
		...defaultParams.args,
		color: 'red',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Waxflower: Story = {
	args: {
		...defaultParams.args,
		color: 'waxflower',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const BrightYellow: Story = {
	args: {
		...defaultParams.args,
		color: 'bright-yellow',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const HaloGreen: Story = {
	args: {
		...defaultParams.args,
		color: 'halo-green',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Blue: Story = {
	args: {
		...defaultParams.args,
		color: 'blue',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const Lavender: Story = {
	args: {
		...defaultParams.args,
		color: 'lavender',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const White: Story = {
	args: {
		...defaultParams.args,
		color: 'white',
	},
	parameters: {
		...defaultParams.parameters,
	},
};
