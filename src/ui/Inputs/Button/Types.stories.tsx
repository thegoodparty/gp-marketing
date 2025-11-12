import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from '../../_data/content.tsx';
import { ComponentButton } from '../Button.tsx';

const meta: Meta<typeof ComponentButton> = {
	title: 'Atoms/Button/Types',
	component: ComponentButton,
	render: args => <ComponentButton {...args} />,
};

export default meta;

type Story = StoryObj<typeof ComponentButton>;

const Default = {
	args: {
		...primaryButton,
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const InternalLink: Story = {
	args: {
		...Default.args,
		buttonType: 'internal' as const,
	},
	parameters: {
		...Default.parameters,
	},
};

export const ExternalLink: Story = {
	args: {
		...Default.args,
		buttonType: 'external' as const,
	},
	parameters: {
		...Default.parameters,
	},
};

export const Download: Story = {
	args: {
		...Default.args,
		buttonType: 'download' as const,
	},
	parameters: {
		...Default.parameters,
	},
};
