/**
 * The pledge block's default content: what Studio pre-fills when an editor adds
 * the block, and what the person-profile code seed renders when no Sanity
 * template exists. Both read this so the two can never drift. Copy follows the
 * Voter Guide frame (Figma 2156-34297), with the Anti-Corruption sentence
 * finished and no link on "GoodParty.org" (Emily, 2026-10-06).
 */

const richText = (key: string, text: string) => [
	{
		_key: key,
		_type: 'block',
		children: [{ _key: `${key}-span`, _type: 'span', marks: [], text }],
		markDefs: [],
		style: 'normal',
	},
];

const pledgeCard = (key: string, icon: string, title: string, copy: string) => ({
	_key: key,
	_type: 'pledgeCardItem',
	field_icon: icon,
	field_title: title,
	block_summaryText: richText(`${key}-copy`, copy),
});

export const GOODPARTY_PLEDGE_TITLE = 'The GoodParty.org Pledge';

export const GOODPARTY_PLEDGE_INTRO =
	'GoodParty.org only works with candidates and elected officials who are independent of both major parties and the influence of big money. Their positions on individual issues may vary, but they are eligible to take the pledge if they commit to being:';

export const GOODPARTY_PLEDGE_CARDS = [
	pledgeCard(
		'pledge-independent',
		'heart',
		'Independent',
		'Candidates run and serve as nonpartisan, independent, or third-party candidates, not as Democrats or Republicans. They agree to not accept endorsements from either the Republican or Democratic party.',
	),
	pledgeCard(
		'pledge-people-first',
		'users',
		'People First',
		'Candidates get a majority of their funding from individuals, not from political action committees (PACs), lobbies, unions, or corporations. Once elected, they pledge to focus on solving the problems facing their constituents, not serving themselves or special interests.',
	),
	pledgeCard(
		'pledge-anti-corruption',
		'star',
		'Anti-Corruption',
		'Candidates and officials pledge to uphold the highest level of integrity by being open, transparent, and accountable about their donors, positions, and progress. They agree to only serve the people, and to use the best tools and data available to stay connected and responsive to their constituents.',
	),
];

export const goodPartyOrgPledgeInitialValue = {
	summaryInfo: {
		_type: 'summaryInfo',
		field_title: GOODPARTY_PLEDGE_TITLE,
		block_summaryText: richText('pledge-intro', GOODPARTY_PLEDGE_INTRO),
		field_textSize: 'Medium',
	},
	goodPartyOrgPledgeItems: {
		_type: 'goodPartyOrgPledgeItems',
		list_pledgeCards: GOODPARTY_PLEDGE_CARDS,
	},
	goodPartyOrgPledgeDesignSettings: {
		_type: 'goodPartyOrgPledgeDesignSettings',
		field_blockColorCreamMidnight: 'MidnightDark',
		field_iconColor6ColorsWhiteMixed: 'Mixed',
		field_columnLayout12Columns: '3Col',
	},
};
