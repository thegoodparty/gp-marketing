import type { Meta, StoryObj } from '@storybook/react';

import { FactsCard } from './FactsCard.tsx';

const meta: Meta<typeof FactsCard> = {
	title: 'Components/Facts Card',
	component: FactsCard,
	render: args => <FactsCard {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23671-32419&t=egVvXVFVcxPfgkND-0',
		},
	},
	decorators: [
		Story => (
			<div className='max-w-xs'>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Population: Story = {
	args: {
		factType: 'population',
		label: 'Population',
		value: '10,019,635',
	},
};

export const LargestCity: Story = {
	args: {
		factType: 'largest-city',
		label: 'Largest City',
		value: 'Los Angeles',
	},
};

export const Density: Story = {
	args: {
		factType: 'density',
		label: 'Density (per sq mi)',
		value: '12,000',
	},
};

export const MedianIncome: Story = {
	args: {
		factType: 'median-income',
		label: 'Median Income',
		value: '$76,367',
	},
};

export const UnemploymentRate: Story = {
	args: {
		factType: 'unemployment-rate',
		label: 'Unemployment Rate',
		value: '4.2%',
	},
};

export const AverageHomeValue: Story = {
	args: {
		factType: 'average-home-value',
		label: 'Average Home Value',
		value: '$485,000',
	},
};

export const CustomIcon: Story = {
	args: {
		factType: 'custom',
		label: 'Custom Fact',
		value: 'Custom Value',
		icon: 'star',
	},
};
