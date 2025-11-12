import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button.tsx';

const meta: Meta<typeof Button> = {
	title: 'Atoms/Button/Ghost Inverse',
	component: Button,
	render: args => <Button {...args} />,
	decorators: [
		Story => (
			<div className='bg-midnight-900 h-screen'>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Button>;

const Default = {
	args: {
		children: 'Button text',
		styleType: 'ghost-inverse' as const,
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Enabled: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
	parameters: {
		...Default.parameters,
	},
};
