import type { Meta, StoryObj } from '@storybook/react';
import { RichData } from '~/ui/RichData.tsx';
import { ImageContentCard } from '~/ui/ImageContentCard.tsx';
import { imageJpg } from '~/ui/_data/media.tsx';

const meta: Meta<typeof ImageContentCard> = {
	title: 'Molecules/Image Content Card',
	component: ImageContentCard,
	render: args => <ImageContentCard {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
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
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};
