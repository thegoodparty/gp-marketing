import type { Sections } from '~/PageSections';

/**
 * Static profile page section layout (from profile.json template).
 * Used when Sanity profile landing page is not available.
 */
export const PROFILE_PAGE_SECTIONS = [
	{
		_key: 'a154f5843c8d',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
		},
	},
	{
		_key: 'ca7f2bfda6dc',
		_type: 'component_profileHero',
		profileHeroDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
		},
	},
	{
		_key: '7cd5d94ca613',
		_type: 'component_claimProfileBlock',
		claimProfileBlockContent: {
			exampleCard: {
				field_showBadge: true,
			},
			field_body: 'Enhance your profile by signing up.',
			field_headline: 'This profile is unclaimed',
		},
		claimProfileBlockDesignSettings: {
			field_blockColorCreamMidnight: 'Cream',
		},
		ctaAction: {
			_type: 'ctaActionWithShared',
			field_buttonText: 'Join today',
			text: 'Join today',
			field_ctaActionWithShared: 'SignUp',
			_key: null,
			action: null,
			hierarchy: null,
			link: {},
			field_externalLink: null,
			anchor: null,
			ref_download: null,
			formId: null,
		},
	},
	{
		_key: 'b7422a8119f2',
		_type: 'component_profileContentBlock',
		profileContentBlockDesignSettings: {
			field_blockColorCreamMidnight: 'Cream',
		},
		componentSettings: null,
	},
	{
		_key: 'c157b05c22e8',
		_type: 'component_goodPartyOrgPledge',
		goodPartyOrgPledgeDesignSettings: {
			_type: 'goodPartyOrgPledgeDesignSettings',
			field_blockColorCreamMidnight: 'MidnightDark',
			field_iconColor6ColorsWhiteMixed: 'Mixed',
			field_columnLayout12Columns: '1Col',
		},
		goodPartyOrgPledgeItems: {
			_type: 'goodPartyOrgPledgeItems',
			list_pledgeCards: [
				{
					_key: '5658a7d1b802',
					_type: 'pledgeCardItem',
					block_summaryText: [
						{
							_key: '366896addb3b',
							_type: 'block',
							children: [
								{
									_key: '07cc0287a5f2',
									_type: 'span',
									marks: [],
									text: 'I will run and serve as a nonpartisan, independent, or third-party candidate, not as a Democrat or Republican. I will not accept endorsements from either the Republican or Democratic party.',
								},
							],
							markDefs: [],
							style: 'normal',
						},
					],
					field_icon: 'heart',
					field_title: 'Independent',
				},
				{
					_key: '70dd0b257564',
					_type: 'pledgeCardItem',
					block_summaryText: [
						{
							_key: '6b028741a856',
							_type: 'block',
							children: [
								{
									_key: 'd49883dabfea',
									_type: 'span',
									marks: [],
									text: 'I get a majority of my funding from individuals, not from political action committees (PACs), lobbies, unions, or corporations. Once elected, I will focus on solving the problems facing my constituents, not serving myself or special interests.',
								},
							],
							markDefs: [],
							style: 'normal',
						},
					],
					field_icon: 'users',
					field_title: 'People-First',
				},
				{
					_key: 'ce8782486805',
					_type: 'pledgeCardItem',
					block_summaryText: [
						{
							_key: 'e3f098e6cf0d',
							_type: 'block',
							children: [
								{
									_key: 'c4bb0a120950',
									_type: 'span',
									marks: [],
									text: 'I will always uphold the highest level of integrity by being open, transparent, and accountable about my donors, positions, and progress. I only serve the people, so I will use the best tools and data available to stay connected and responsive to my constituents.',
								},
							],
							markDefs: [],
							style: 'normal',
						},
					],
					field_icon: 'star',
					field_title: 'Anti-Corruption',
				},
			],
		},
		summaryInfo: {
			_type: 'summaryInfo',
			block_summaryText: [
				{
					_key: '61e38cb0f97f',
					_type: 'block',
					children: [
						{
							_key: '31a12482ccf9',
							_type: 'span',
							marks: [],
							text: 'We only work with candidates and elected officials who are independent of both major parties and the influence of big money. They can take any positions on issues for their constituents, as long as they pledge to be:',
						},
					],
					markDefs: [],
					style: 'normal',
				},
			],
			field_textSize: 'Medium',
			field_title: 'The GoodParty.org Pledge',
			list_buttons: [
				{
					_key: 'a3f2c8d91b6e',
					_type: 'button',
					action: 'Internal',
					text: 'Learn more',
					link: { href: '/about' },
					field_buttonText: 'Learn more',
					field_buttonHierarchy: 'Primary',
					field_ctaActionWithShared: 'Internal',
				},
			],
		},
	},
	{
		_key: 'e7d1c490e84f',
		_type: 'component_stepperBlock',
		stepperBlockDesignSettings: {
			_type: 'stepperBlockDesignSettings',
			field_blockColorCreamMidnight: 'Cream',
		},
		stepperBlockItems: {
			_type: 'stepperBlockItems',
			list_stepperBlockItems: [
				{
					_key: '8c365b9130f9',
					_type: 'stepperBlockItem',
					stepperBlockItemDesignSettings: {
						_type: 'stepperBlockItemDesignSettings',
						field_mediaAlignmentRightLeft: 'Right',
					},
					stepperBlockItemMedia: {
						_type: 'stepperBlockItemMedia',
						img_image: { _type: 'img_image', asset: { _ref: 'image-e4daa7ca2fa896c337d1c7a58d6fe068fc8b7984-996x985-png', _type: 'reference' } },
						showFullImage: true,
					},
					summaryInfo: {
						_type: 'summaryInfo',
						block_summaryText: [
							{
								_key: '63b36c511705',
								_type: 'block',
								children: [{ _key: '9a26941a6f5f', _type: 'span', marks: [], text: 'Discover how you can run for office and make a real impact in your community.' }],
								markDefs: [],
								style: 'normal',
							},
						],
						field_textSize: 'Medium',
						field_title: 'Run for office',
						list_buttons: [
							{
								_key: '652809c7f305',
								_type: 'button',
								field_buttonHierarchy: 'Primary',
								field_buttonText: 'Start your campaign',
								field_ctaActionWithShared: 'SignUp',
							},
						],
					},
				},
				{
					_key: '5ad791e554a3',
					_type: 'stepperBlockItem',
					stepperBlockItemDesignSettings: {
						_type: 'stepperBlockItemDesignSettings',
						field_mediaAlignmentRightLeft: 'Left',
					},
					stepperBlockItemMedia: {
						_type: 'stepperBlockItemMedia',
						img_image: { _type: 'img_image', asset: { _ref: 'image-a1bb7d9df1d5b2bb30a35f706575b6aa075aaf9c-908x829-png', _type: 'reference' } },
						showFullImage: true,
					},
					summaryInfo: {
						_type: 'summaryInfo',
						block_summaryText: [
							{
								_key: '23a958cc2e84',
								_type: 'block',
								children: [
									{
										_key: '0c7cf58c1fd0',
										_type: 'span',
										marks: [],
										text: 'Connect with other Independents, and explore free training to learn how to run for office.',
									},
								],
								markDefs: [],
								style: 'normal',
							},
						],
						field_textSize: 'Medium',
						field_title: 'GoodParty.org Community',
						list_buttons: [
							{
								_key: 'a6cc30313884',
								_type: 'button',
								field_buttonHierarchy: 'Primary',
								field_buttonText: 'Join the Community',
								field_ctaActionWithShared: 'External',
								field_externalLink: 'https://community.goodparty.org',
							},
						],
					},
				},
				{
					_key: 'dcc837fb0ffc',
					_type: 'stepperBlockItem',
					stepperBlockItemDesignSettings: {
						_type: 'stepperBlockItemDesignSettings',
						field_mediaAlignmentRightLeft: 'Right',
					},
					stepperBlockItemMedia: {
						_type: 'stepperBlockItemMedia',
						img_image: { _type: 'img_image', asset: { _ref: 'image-fd4b76b12be319729607bc8508953e0849471eab-1144x1230-png', _type: 'reference' } },
						showFullImage: true,
					},
					summaryInfo: {
						_type: 'summaryInfo',
						block_summaryText: [
							{
								_key: 'eb0f62833c7d',
								_type: 'block',
								children: [
									{
										_key: 'f61452b1bbc9',
										_type: 'span',
										marks: [],
										text: 'A step-by-step guide to running and winning as an Independent. Free to download, built to help you win local.',
									},
								],
								markDefs: [],
								style: 'normal',
							},
						],
						field_textSize: 'Medium',
						field_title: 'Run Independent. Win local.',
						list_buttons: [
							{
								_key: '8262704f7a85',
								_type: 'button',
								field_buttonHierarchy: 'Primary',
								field_buttonText: 'Download the free e-book',
								field_ctaActionWithShared: 'Internal',
								field_internalLink: { _type: 'field_internalLink', href: { _ref: '1876f6cd-0d57-4e50-911b-2dee7b7fceed', _type: 'reference' } },
							},
						],
					},
				},
			],
		},
		summaryInfo: {
			_type: 'summaryInfo',
			block_summaryText: [
				{
					_key: '8b2244bf7b0f',
					_type: 'block',
					children: [
						{
							_key: '9dc9985e8b57',
							_type: 'span',
							marks: [],
							text: 'Ready to join the movement? Support candidates, run for office, or join our online community of like-minded individuals.',
						},
					],
					markDefs: [],
					style: 'normal',
				},
			],
			field_textSize: 'Medium',
			field_title: 'Build a better democracy with us.',
		},
	},
	{
		_key: '1d079b1027bb',
		_type: 'component_ctaCardsBlock',
		ctaCardOne: {
			_type: 'ctaCardOne',
			ctaActionWithShared: {
				_type: 'ctaActionWithShared',
				field_buttonText: 'Explore candidates running near you',
				text: 'Explore candidates running near you',
				field_ctaActionWithShared: 'Internal',
			},
			field_componentColor6ColorsInverse: 'BrightYellow',
			field_label: 'Candidates',
		},
		ctaCardTwo: {
			_type: 'ctaCardTwo',
			ctaActionWithShared: {
				_type: 'ctaActionWithShared',
				field_buttonText: 'Explore upcoming elections near you',
				text: 'Explore upcoming elections near you',
				field_ctaActionWithShared: 'Internal',
			},
			field_componentColor6ColorsInverse: 'HaloGreen',
			field_label: 'Upcoming elections',
		},
		ctaCardsBlockDesignSettings: {
			_type: 'ctaCardsBlockDesignSettings',
			field_blockColorCreamMidnight: 'Cream',
		},
	},
] as unknown as Sections[];
