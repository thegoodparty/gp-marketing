import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg } from './_data/media.tsx';
import { CareersHeroBlock } from './CareersHeroBlock.tsx';

const meta: Meta<typeof CareersHeroBlock> = {
	title: 'Page Sections/Careers Hero Block',
	component: CareersHeroBlock,
	render: args => <CareersHeroBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const images = Array.from({ length: 8 }, () => imageJpg());

export const Default: Story = {
	args: {
		title: 'Come build a space to dream',
		copy: <p>We're creating the most inspiring place on the internet. Join us.</p>,
		buttons: [
			{
				label: 'Open Roles',
				href: '/',
				buttonType: 'internal',
				buttonProps: { styleType: 'secondary' },
			},
		],
		images,
	},
};

export const NoImages: Story = {
	args: {
		...Default.args,
		images: [],
	},
};
