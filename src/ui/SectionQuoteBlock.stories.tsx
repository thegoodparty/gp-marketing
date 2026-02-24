import type { Meta, StoryObj } from '@storybook/react';

import { SectionQuoteBlock } from './SectionQuoteBlock.tsx';
import { avatarJpg } from './_data/media.tsx';

const meta: Meta<typeof SectionQuoteBlock> = {
	title: 'New Components/Page Sections/Section Quote Block',
	component: SectionQuoteBlock,
	render: args => <SectionQuoteBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=22954-17112&m=dev',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleQuote =
	'GoodParty showed me that I could ACTUALLY win — with a hyper targeted plan. And with their execution help, I was able to bring awareness to my audience and WIN my election.';

const quoteItem = {
	_key: '1',
	copy: sampleQuote,
	author: {
		name: 'Name Surname',
		meta: ['Secondary text'],
		image: avatarJpg(),
	},
};

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Blog Quote',
			title: undefined,
			copy: undefined,
			layout: 'left',
		},
		items: [quoteItem, { ...quoteItem, _key: '2' }],
	},
};

export const FourQuotes: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Blog Quote',
			layout: 'left',
		},
		items: [
			{ ...quoteItem, _key: '1' },
			{ ...quoteItem, _key: '2' },
			{ ...quoteItem, _key: '3' },
			{ ...quoteItem, _key: '4' },
		],
	},
};

export const WithFullHeader: Story = {
	args: {
		backgroundColor: 'cream',
		header: {
			label: 'Blog Quote',
			title: 'What People Are Saying',
			copy: 'Hear from candidates who won with GoodParty.',
			layout: 'center',
		},
		items: [quoteItem, { ...quoteItem, _key: '2' }],
	},
};

export const MidnightBackground: Story = {
	args: {
		backgroundColor: 'midnight',
		header: {
			label: 'Blog Quote',
			layout: 'left',
		},
		items: [quoteItem, { ...quoteItem, _key: '2' }],
	},
};
