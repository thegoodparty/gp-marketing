import type { Meta, StoryObj } from '@storybook/react';

import { LocationFactsBlock } from './LocationFactsBlock.tsx';
import { buttons } from './_data/content.tsx';

const meta: Meta<typeof LocationFactsBlock> = {
	title: 'Page Sections/Location Facts Block',
	component: LocationFactsBlock,
	render: args => <LocationFactsBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23671-32419&t=egVvXVFVcxPfgkND-0',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleFactsCards = [
	{
		factType: 'largest-city',
		label: 'Largest City',
		value: 'Los Angeles',
	},
	{
		factType: 'population',
		label: 'Population',
		value: '39,538,223',
	},
	{
		factType: 'density',
		label: 'Density (per sq mi)',
		value: '254',
	},
	{
		factType: 'median-income',
		label: 'Median Income',
		value: '$78,672',
	},
	{
		factType: 'unemployment-rate',
		label: 'Unemployment Rate',
		value: '4.8%',
	},
	{
		factType: 'average-home-value',
		label: 'Average Home Value',
		value: '$683,996',
	},
];

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Overline',
			title: 'Headline',
			copy: 'Body copy',
			layout: 'center',
			buttons: buttons(),
		},
		factsCards: sampleFactsCards.slice(0, 3),
	},
};

export const WithRealContent: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'California',
			title: 'State Facts',
			copy: 'Key statistics about California to help you understand the local political landscape.',
			layout: 'center',
		},
		factsCards: sampleFactsCards,
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const LeftAlignedHeader: Story = {
	args: {
		...Default.args,
		header: {
			label: 'Overline',
			title: 'Headline',
			copy: 'Body copy',
			layout: 'left',
			buttons: buttons(),
		},
	},
};

export const ThreeCards: Story = {
	args: {
		...Default.args,
		factsCards: sampleFactsCards.slice(0, 3),
	},
};

export const SixCards: Story = {
	args: {
		...Default.args,
		factsCards: sampleFactsCards,
	},
};

export const NoHeader: Story = {
	args: {
		backgroundColor: 'cream',
		factsCards: sampleFactsCards.slice(0, 3),
	},
};

export const CountyExample: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Los Angeles County',
			title: 'County Facts',
			copy: 'Key statistics about Los Angeles County.',
			layout: 'center',
		},
		factsCards: [
			{
				factType: 'largest-city',
				label: 'Largest City',
				value: 'Los Angeles',
			},
			{
				factType: 'population',
				label: 'Population',
				value: '10,019,635',
			},
			{
				factType: 'density',
				label: 'Density (per sq mi)',
				value: '2,500',
			},
		],
	},
};
