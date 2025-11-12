import type { Meta, StoryObj } from '@storybook/react';
import { CarouselIndicator } from './CarouselIndicator.tsx';

const meta: Meta<typeof CarouselIndicator> = {
	title: 'Atoms/Carousel Indicator',
	component: CarouselIndicator,
	render: args => <CarouselIndicator {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		className: 'py-4',
	},
};

export const Active: Story = {
	args: {
		...Default.args,
		active: true,
	},
};
