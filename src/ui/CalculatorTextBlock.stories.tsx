import type { Meta, StoryObj } from '@storybook/react';

import { CalculatorTextBlock } from './CalculatorTextBlock.tsx';
import { resolveTextSize } from './_lib/resolveTextSize.ts';

const meta: Meta<typeof CalculatorTextBlock> = {
	title: 'New Components/Page Sections/Calculator Text Block',
	component: CalculatorTextBlock,
	render: args => <CalculatorTextBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const copy = (
	<>
		<p>
			Voter data helps you target the right people, plan outreach, and track turnout trends—but it's locked
			behind big-party paywalls.
		</p>
		<p>
			GoodParty.org levels the playing field with the same data for a fraction of the cost.
		</p>
	</>
);

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		layout: 'calculator-left',
		calculator: {
			heading: 'Cost of Voter Records',
			tryItText: 'Try it yourself',
		},
		text: {
			title: 'Access to voter data is limited for independents',
			copy,
			buttons: [
				{
					label: 'Get started',
					href: '/get-started',
					buttonType: 'internal',
					buttonProps: { styleType: 'primary' },
				},
			],
		},
		textSize: resolveTextSize('Medium'),
	},
};

export const CalculatorRight: Story = {
	args: {
		...Default.args,
		layout: 'calculator-right',
	},
};

export const MidnightBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};
