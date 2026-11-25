import type { Meta, StoryObj } from '@storybook/react';

import { ArticleSummary } from './ArticleSummary.tsx';
import { RichData } from './RichData.tsx';

const meta: Meta<typeof ArticleSummary> = {
	title: 'Editorial/Article Summary',
	component: ArticleSummary,
	render: args => <ArticleSummary {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const paragraph = (key: string, text: string, bold?: string, link?: string) => ({
	_type: 'block',
	_key: key,
	style: 'normal',
	markDefs: link ? [{ _type: 'inlineInternalLink', _key: `${key}-link`, field_internalLink: { href: '/blog' } }] : [],
	children: [
		{ _type: 'span', _key: `${key}-a`, text, marks: [] },
		...(bold ? [{ _type: 'span', _key: `${key}-b`, text: bold, marks: ['strong'] }] : []),
		...(link ? [{ _type: 'span', _key: `${key}-c`, text: link, marks: [`${key}-link`] }] : []),
	],
});

const oneParagraph = [
	paragraph(
		'p1',
		'This is placeholder text for the article summary. It answers the main question of the article in two to four plain sentences, ',
		'with a bold phrase',
		' and a link.',
	),
];

const twoParagraphs = [
	...oneParagraph,
	paragraph('p2', 'A second short paragraph can follow when the answer needs one more step.'),
];

export const WithLabel: Story = {
	args: {
		label: 'Quick answer',
		children: <RichData value={oneParagraph} />,
	},
};

export const NoLabel: Story = {
	args: {
		children: <RichData value={oneParagraph} />,
	},
};

export const TwoParagraphs: Story = {
	args: {
		label: 'Quick answer',
		children: <RichData value={twoParagraphs} />,
	},
};
