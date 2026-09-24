import type { Meta, StoryObj } from '@storybook/react';

import { ElectionsNearYouBlock } from './ElectionsNearYouBlock.tsx';

const meta: Meta<typeof ElectionsNearYouBlock> = {
	title: 'New Components/Page Sections/Elections Near You Block',
	component: ElectionsNearYouBlock,
	render: args => <ElectionsNearYouBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=3096-3858',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		backgroundColor: 'midnight',
		heading: 'Find more elections near you',
		body: 'Find upcoming elections in your city or county.',
		buttonLabel: 'Search',
	},
};

export const Cream: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};
