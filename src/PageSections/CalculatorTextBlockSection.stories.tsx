import type { Meta, StoryObj } from '@storybook/react';

import type { Component_calculatorTextBlock } from 'sanity.types';

import { CalculatorTextBlockSection } from './CalculatorTextBlockSection.tsx';

const meta: Meta<typeof CalculatorTextBlockSection> = {
	title: 'New Components/Page Sections/Calculator Text Block Section',
	component: CalculatorTextBlockSection,
};

export default meta;

type Story = StoryObj<typeof meta>;

const blockSummaryText = [
	{
		_key: 'p1',
		_type: 'block' as const,
		children: [
			{
				_key: 's1',
				_type: 'span' as const,
				marks: [],
				text: 'Voter data helps you target the right people, plan outreach, and track turnout trends—but it\'s locked behind big-party paywalls.',
			},
		],
		style: 'normal',
	},
	{
		_key: 'p2',
		_type: 'block' as const,
		children: [
			{
				_key: 's2',
				_type: 'span' as const,
				marks: [],
				text: 'GoodParty.org levels the playing field with the same data for a fraction of the cost.',
			},
		],
		style: 'normal',
	},
];

const baseSection: Component_calculatorTextBlock = {
	_key: 'calc-1',
	_type: 'component_calculatorTextBlock',
	summaryInfo: {
		field_title: 'Access to voter data is limited for independents',
		block_summaryText: blockSummaryText,
		list_buttons: [
			{
				_key: 'btn1',
				action: 'Internal',
				hierarchy: 'Primary',
				link: { href: '/get-started', name: 'Get started' },
				text: 'Get started',
			},
		],
	},
	calculatorTextBlockDesignSettings: {
		field_blockColorCreamMidnight: 'Cream',
		field_calculatorLayout: 'CalculatorLeft',
	},
};

export const SectionCreamCalculatorLeft: Story = {
	args: baseSection,
};

export const SectionCreamCalculatorRight: Story = {
	args: {
		...baseSection,
		calculatorTextBlockDesignSettings: {
			...baseSection.calculatorTextBlockDesignSettings!,
			field_calculatorLayout: 'CalculatorRight',
		},
	},
};

export const SectionMidnightCalculatorLeft: Story = {
	args: {
		...baseSection,
		calculatorTextBlockDesignSettings: {
			...baseSection.calculatorTextBlockDesignSettings!,
			field_blockColorCreamMidnight: 'MidnightDark',
		},
	},
};

export const SectionMidnightCalculatorRight: Story = {
	args: {
		...baseSection,
		calculatorTextBlockDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
			field_calculatorLayout: 'CalculatorRight',
		},
	},
};
