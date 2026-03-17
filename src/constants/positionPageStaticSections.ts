/**
 * Static content for position page sections.
 * Extracted from Sanity document 6c5afa49-ad46-4b9e-803e-5559cc672b3e (tlz.json).
 * Placeholders [office name], [State], [County or City] are replaced at runtime.
 */

export const POSITION_PAGE_CTA_BANNER = {
	title: 'Running for [office name]?',
	copy: 'Get a free strategy consultation with our team to discuss your election and how GoodParty.org can help.',
	backgroundColor: 'cream' as const,
	color: 'lavender' as const,
	button: {
		buttonType: 'internal' as const,
		href: '/contact',
		label: 'Get free demo',
		buttonProps: { styleType: 'primary' as const },
	},
} as const;

export const POSITION_PAGE_FAQ = {
	title: 'FAQs',
	copy: "We've put together some commonly asked questions to help you find the answers you need. Still have questions? Contact us — we're happy to help!",
	backgroundColor: 'cream' as const,
	buttons: [
		{
			buttonType: 'internal' as const,
			href: '/contact',
			label: 'Contact us',
			buttonProps: { styleType: 'primary' as const },
		},
	],
	items: [
		{
			title: 'How do I run for this office?',
			copy: 'Visit our Run for Office resources to learn about eligibility requirements, filing deadlines, and the steps to get on the ballot.',
		},
		{
			title: 'What support does GoodParty.org provide?',
			copy: 'GoodParty.org offers free tools, training, and community support to help Independent candidates run and win.',
		},
		{
			title: 'How can I find candidates in my area?',
			copy: 'Use the View candidates button above to see who is running for this position in your district.',
		},
	],
} as const;

export const POSITION_PAGE_CTA_BLOCK = {
	label: 'Candidates',
	title: "See who's running for [office name] in [County or City], [State]",
	copy: "See who's been empowered by GoodParty.org to help you vote with confidence.",
	backgroundColor: 'cream' as const,
	color: 'lavender' as const,
	primaryButtonLabel: 'View all candidates',
} as const;

export const POSITION_PAGE_TWO_UP_CARD = {
	backgroundColor: 'cream' as const,
	card1: {
		type: 'value-prop' as const,
		title: 'Free tools for Independent candidates!',
		color: 'bright-yellow' as const,
		list: [
			{ title: 'Track voter outreach goals and stay organized', icon: 'door-closed' },
			{ title: 'Instantly generate custom campaign content', icon: 'pencil' },
			{ title: 'Access grassroots support nationwide', icon: 'globe' },
		],
		button: {
			buttonType: 'internal' as const,
			href: '/contact',
			label: 'Get free demo',
			buttonProps: { styleType: 'primary' as const },
		},
	},
	card2: {
		type: 'value-prop' as const,
		title: 'How GoodParty.org can help you.',
		color: 'lavender' as const,
		list: [
			{ title: 'Access essential voter data and analytics', icon: 'chart-column-increasing' },
			{ title: 'Get a custom strategy and plan to win', icon: 'trophy' },
			{ title: 'Powerful outreach tools to win votes', icon: 'users-round' },
		],
		button: {
			buttonType: 'external' as const,
			href: 'https://app.goodparty.org/sign-up',
			label: 'Get started',
			buttonProps: { styleType: 'primary' as const },
		},
	},
} as const;
