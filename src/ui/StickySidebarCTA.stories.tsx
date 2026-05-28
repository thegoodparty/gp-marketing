import type { Meta, StoryObj } from '@storybook/react';
import { primaryButton } from './_data/content.tsx';
import { StickySidebarCTA } from './StickySidebarCTA.tsx';

const blockSummaryText = [
	{
		_key: 'p1',
		_type: 'block' as const,
		children: [
			{
				_key: 's1',
				_type: 'span' as const,
				marks: [],
				text: 'GoodParty.org gives independent candidates the tools, data, and support to run competitive campaigns without big-party baggage.',
			},
		],
		markDefs: [],
		style: 'normal',
	},
];

const meta: Meta<typeof StickySidebarCTA> = {
	title: 'Molecules/Sticky Sidebar CTA',
	component: StickySidebarCTA,
	decorators: [
		Story => (
			<div className='max-w-xs'>
				<Story />
			</div>
		),
	],
	render: args => <StickySidebarCTA {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
	label: 'Get involved',
	title: 'Run for office on your own terms',
	copy: blockSummaryText,
	buttons: [primaryButton],
	color: 'lavender' as const,
};

export const Default: Story = {
	args: defaultArgs,
};

export const Red: Story = {
	args: { ...defaultArgs, color: 'red' },
};

export const Waxflower: Story = {
	args: { ...defaultArgs, color: 'waxflower' },
};

export const BrightYellow: Story = {
	args: { ...defaultArgs, color: 'bright-yellow' },
};

export const HaloGreen: Story = {
	args: { ...defaultArgs, color: 'halo-green' },
};

export const Blue: Story = {
	args: { ...defaultArgs, color: 'blue' },
};

export const Lavender: Story = {
	args: { ...defaultArgs, color: 'lavender' },
};

export const Midnight: Story = {
	args: { ...defaultArgs, color: 'midnight' },
};

export const Cream: Story = {
	args: { ...defaultArgs, color: 'cream' },
};

export const TitleOnly: Story = {
	args: {
		title: defaultArgs.title,
		buttons: defaultArgs.buttons,
		color: 'lavender',
	},
};
