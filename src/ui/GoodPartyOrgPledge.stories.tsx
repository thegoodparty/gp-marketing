import type { Meta, StoryObj } from '@storybook/react';
import { GoodPartyOrgPledge } from './GoodPartyOrgPledge.tsx';
import { RichData } from './RichData.tsx';
import { GOODPARTY_PLEDGE_CARDS, GOODPARTY_PLEDGE_INTRO, GOODPARTY_PLEDGE_TITLE } from '~/lib/goodPartyOrgPledgeDefaults';

const meta: Meta<typeof GoodPartyOrgPledge> = {
	title: 'New Components/Page Sections/GoodParty.org Pledge',
	component: GoodPartyOrgPledge,
	render: args => <GoodPartyOrgPledge {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const VOTER_GUIDE_DESKTOP = 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2156-34297';
const VOTER_GUIDE_MOBILE = 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2188-38249';

const pledgeCards = GOODPARTY_PLEDGE_CARDS.map(card => ({
	icon: card.field_icon,
	title: card.field_title,
	content: <RichData value={card.block_summaryText} />,
}));

/** The retired fourth element, for the two-column look older templates still carry. */
const civilityCard = {
	icon: 'hand-heart',
	title: 'Civility',
	content: pledgeCards[0]?.content,
};

/** The Studio preset: the block exactly as an editor gets it when they add it. */
const defaultArgs = {
	header: {
		title: GOODPARTY_PLEDGE_TITLE,
		copy: GOODPARTY_PLEDGE_INTRO,
	},
	pledgeCards,
	backgroundColor: 'midnight' as const,
	iconBg: 'mixed' as const,
	columnLayout: '3Col' as const,
};

export const Default: Story = {
	args: defaultArgs,
	parameters: {
		design: { type: 'figma', url: VOTER_GUIDE_DESKTOP },
	},
};

export const Mobile: Story = {
	args: defaultArgs,
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
		design: { type: 'figma', url: VOTER_GUIDE_MOBILE },
	},
};

export const Cream: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'cream',
	},
	parameters: {
		design: { type: 'figma', url: VOTER_GUIDE_DESKTOP },
	},
};

/** A /people profile supplies one button for the whole band, below the cards. */
export const WithSectionButton: Story = {
	args: {
		...defaultArgs,
		footerButtons: [{ buttonType: 'internal' as const, href: '/about', label: 'Learn more' }],
	},
	parameters: {
		design: { type: 'figma', url: VOTER_GUIDE_DESKTOP },
	},
};

export const SingleColumn: Story = {
	args: {
		...defaultArgs,
		columnLayout: '1Col',
	},
};

export const TwoColumns: Story = {
	args: {
		...defaultArgs,
		columnLayout: '2Col',
		pledgeCards: [...pledgeCards, civilityCard],
	},
};

export const SingleIconColor: Story = {
	args: {
		...defaultArgs,
		iconBg: 'red',
	},
};
