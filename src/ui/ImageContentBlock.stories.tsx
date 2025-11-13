import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { RichData } from '~/ui/RichData.tsx';
import { ImageContentBlock } from '~/ui/ImageContentBlock.tsx';
import { imageJpg } from '~/ui/_data/media.tsx';

const meta: Meta<typeof ImageContentBlock> = {
	title: 'Page Sections/Image Content Block',
	component: ImageContentBlock,
	render: args => <ImageContentBlock {...args} />,
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

const item = {
	title: 'Headline',
	subtitle: 'Subtitle',
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
	image: imageJpg(),
};

export const ContentCream: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		backgroundColor: 'cream',
	},
	parameters: {
		...defaultParams.parameters,
	},
};

export const ContentMidnight: Story = {
	args: {
		...defaultParams.args,
		items: Array(10).fill(item),
		backgroundColor: 'midnight',
	},
	parameters: {
		...defaultParams.parameters,
	},
};
