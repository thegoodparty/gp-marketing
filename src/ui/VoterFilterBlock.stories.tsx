import type { Meta, StoryObj } from '@storybook/react';

import { VoterFilterBlock } from './VoterFilterBlock.tsx';

const meta: Meta<typeof VoterFilterBlock> = {
	title: 'New Components/Page Sections/Voter Filter Block',
	component: VoterFilterBlock,
	render: args => <VoterFilterBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			title: 'Build your list with any of these filters',
			copy: 'Combine filters to build the exact list you need, or start from a recommended list. Saved lists carry into every outreach tool.',
		},
		groups: [
			{
				title: 'How they vote',
				icon: 'vote',
				filters: [
					{ label: 'Voter likelihood', values: ['Super', 'Likely', 'Unreliable', 'Unlikely', 'Unknown'] },
					{ label: 'Political party', values: ['Democrat', 'Independent', 'Republican', 'Other'] },
					{ label: 'Ideology', values: ['Conservative', 'Moderate', 'Progressive', 'Unknown'] },
				],
			},
			{
				title: 'How to reach them',
				icon: 'smartphone',
				filters: [
					{ label: 'Cell phone', values: ['Has cell phone'] },
					{ label: 'Landline', values: ['Has landline'] },
					{ label: 'Prior contacts made', values: ['0', '1', '2', '3', '4', '5+'] },
				],
			},
		],
	},
};

export const Midnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'mobile1', isRotated: false },
	},
};
