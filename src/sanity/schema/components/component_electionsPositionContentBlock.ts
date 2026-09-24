import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

/**
 * Where the block's default buttons and links point. The block is already on the
 * live Position template with none of these fields filled, so these defaults are
 * what every position page shows until an editor changes a field in Studio.
 */
export const POSITION_CONTENT_LINKS = {
	run: '/run-for-office',
	pledge: '/run-for-office',
	community: 'https://community.goodparty.org',
	voterRegistration: 'https://vote.gov',
	pollingPlace: 'https://www.vote.org/polling-place-locator/',
	mailBallot: 'https://www.vote.org/absentee-ballot/',
} as const;

/*
 * Every copy field here is a plain string or text, and every link is a pasted
 * path, deliberately. The shared sections query that fetches every block on a
 * page sits within a few kilobytes of Sanity's 300 KB request limit, and each
 * rich text or button picker projection adds 2 to 4 KB to it; a version of this
 * block with three of each pushed every page build over the limit.
 */

/**
 * The Figma copy, used whenever the matching Sanity field is empty. Keep in step
 * with the field descriptions below: every string here is what an editor sees
 * described as "the default".
 */
export const POSITION_CONTENT_DEFAULTS = {
	siderail: {
		onThisPageTitle: 'On this page',
		exploreTitle: 'Explore more races in [County or City]',
		exploreBody:
			"Browse every upcoming election in [County or City] and find independent candidates who've taken the GoodParty.org Pledge.",
		exploreButtonLabel: 'See all [County or City] races',
		shareTitle: 'Know someone who should run for [office name]?',
		shareBody:
			'Our democracy is stronger when everyday people step up. Share this page to nominate someone you trust to run for [office name].',
		shareButtonLabel: 'Share',
	},
	badgeCallout: {
		title: 'What this badge means',
		body: "Candidates with the heart and star badge pledged to run without money or endorsement from either major party. Any candidate can take the GoodParty.org Pledge, and those without the badge haven't yet. It's not an endorsement, but it's worth weighing when you fill out your ballot.",
	},
	peopleLists: {
		candidatesHeading: 'Candidates for [office name]',
		resultsHeading: 'Results for [office name]',
		officeholdersHeading: "Who's currently in office",
		showMoreLabel: 'See more candidates',
	},
	brandedCta: {
		noPledgedHeadline: 'Tired of choosing between red and blue?',
		noPledgedBody:
			"There aren't any candidates for [office name] who've taken the GoodParty.org Pledge to serve people, not parties or big money. Learn how you can step up to run.",
		pledgedRunningHeadline: 'Tired of choosing between red and blue?',
		pledgedRunningBody:
			'Candidates for [office name] have taken the GoodParty.org Pledge to serve people, not parties or big money. See who they are above, or learn how you can step up to run.',
		pledgedWonHeadline: 'A GoodParty.org candidate won this race.',
		pledgedWonBody: 'Proof that people-first, independent candidates win. Want to be next? The next election is already on the horizon.',
		noPledgedWonHeadline: 'Tired of choosing between red and blue?',
		noPledgedWonBody: "There weren't any winners this cycle who took the GoodParty.org Pledge. Learn how you can step up to run next.",
		buttonLabel: 'Learn more',
	},
	voterReadiness: {
		title: "Are you ready for [County or City]'s next election?",
		subtitle: 'Get registered and ready to vote, whether in person or by mail.',
		items: [
			{
				key: 'registration',
				icon: 'clipboard-check',
				title: 'Check your voter registration',
				copy: 'Check your voter registration in under a minute.',
				buttonLabel: 'Check my registration',
				href: POSITION_CONTENT_LINKS.voterRegistration,
			},
			{
				key: 'polling',
				icon: 'vote',
				title: 'Find your polling location',
				copy: 'Learn where to go to vote in person.',
				buttonLabel: 'Find my polling place',
				href: POSITION_CONTENT_LINKS.pollingPlace,
			},
			{
				key: 'mail',
				icon: 'mail-open',
				title: 'Request a mail-in ballot',
				copy: 'Apply for an absentee ballot to vote by mail.',
				buttonLabel: 'Request my ballot',
				href: POSITION_CONTENT_LINKS.mailBallot,
			},
		],
	},
	aboutPosition: {
		heading: 'About [office name]',
		cardTitle: 'About this position',
		electionTypesLabel: 'Election type',
	},
	howToRun: {
		heading: 'How to run for [office name]',
		electionOverBanner:
			"This election is over. Filing for the next [office name] election opens after results are certified. Here's how the process works so you're ready.",
		step1Title: 'Meet eligibility requirements',
		step2Title: 'File for office',
		step3Title: 'Launch your campaign',
		step3Body:
			'A real campaign starts with a real plan. Get a custom campaign plan from GoodParty.org, personalized for your race and district.',
		step3ButtonLabel: 'Get started',
		needHelp:
			"Need help? You don't have to run alone. Join the GoodParty.org Community to get advice from real independents who have run and won.",
	},
} as const;

const TOKEN_NOTE = 'Supports [office name] and location tokens such as [County or City].';
const LINK_NOTE = 'A site path such as /run-for-office, or a full https:// address.';

const stringField = (name: string, title: string, defaultValue: string, description?: string) => ({
	title,
	name,
	type: 'string',
	description: description ? `${description} Default: "${defaultValue}"` : `Default: "${defaultValue}"`,
	initialValue: defaultValue,
});

const textField = (name: string, title: string, defaultValue: string, description?: string) => ({
	title,
	name,
	type: 'text',
	rows: 3,
	description: description ? `${description} Default: "${defaultValue}"` : `Default: "${defaultValue}"`,
	initialValue: defaultValue,
});

export const component_electionsPositionContentBlock = {
	title: 'Elections Position Content Block',
	name: 'component_electionsPositionContentBlock',
	description:
		'The body of a Position Page below the hero: the side rail, the candidate and officeholder lists, the branded CTA, the voter readiness links, the About card and the How to run steps. Its state follows the hero (filing, mid-election, decided) from the race data, never by hand, and any section with no data for a page is hidden. Sanity controls the copy and the design settings; every field has a default.',
	type: 'object',
	icon: getIcon('FileText'),
	fields: [
		{
			title: 'Side rail',
			name: 'siderail',
			type: 'object',
			group: 'siderail',
			fields: [
				stringField('field_onThisPageTitle', '"On this page" title', POSITION_CONTENT_DEFAULTS.siderail.onThisPageTitle),
				stringField('field_exploreTitle', 'Explore card title', POSITION_CONTENT_DEFAULTS.siderail.exploreTitle, TOKEN_NOTE),
				textField('field_exploreBody', 'Explore card body', POSITION_CONTENT_DEFAULTS.siderail.exploreBody, TOKEN_NOTE),
				stringField(
					'field_exploreButtonLabel',
					'Explore card button label',
					POSITION_CONTENT_DEFAULTS.siderail.exploreButtonLabel,
					TOKEN_NOTE,
				),
				stringField('field_shareTitle', 'Share card title', POSITION_CONTENT_DEFAULTS.siderail.shareTitle, TOKEN_NOTE),
				textField('field_shareBody', 'Share card body', POSITION_CONTENT_DEFAULTS.siderail.shareBody, TOKEN_NOTE),
				stringField('field_shareButtonLabel', 'Share button label', POSITION_CONTENT_DEFAULTS.siderail.shareButtonLabel),
			],
		},
		{
			title: 'Badge callout',
			name: 'badgeCallout',
			type: 'object',
			group: 'lists',
			description: 'The blue strip explaining the heart and star mark. Only shown when a candidate or officeholder list is on the page.',
			fields: [
				stringField('field_title', 'Title', POSITION_CONTENT_DEFAULTS.badgeCallout.title),
				textField('field_body', 'Body', POSITION_CONTENT_DEFAULTS.badgeCallout.body),
			],
		},
		{
			title: 'People lists',
			name: 'peopleLists',
			type: 'object',
			group: 'lists',
			fields: [
				stringField(
					'field_candidatesHeading',
					'Candidates heading',
					POSITION_CONTENT_DEFAULTS.peopleLists.candidatesHeading,
					`Shown while the race is open. ${TOKEN_NOTE}`,
				),
				stringField(
					'field_resultsHeading',
					'Results heading',
					POSITION_CONTENT_DEFAULTS.peopleLists.resultsHeading,
					`Replaces the candidates heading once the race is decided. ${TOKEN_NOTE}`,
				),
				stringField(
					'field_officeholdersHeading',
					'Officeholders heading',
					POSITION_CONTENT_DEFAULTS.peopleLists.officeholdersHeading,
					TOKEN_NOTE,
				),
				stringField('field_showMoreLabel', '"See more" button label', POSITION_CONTENT_DEFAULTS.peopleLists.showMoreLabel),
			],
		},
		{
			title: 'Branded CTA',
			name: 'brandedCta',
			type: 'object',
			group: 'brandedCta',
			description:
				'The heart and star card. Which pair of headline and body shows depends on the race state and on whether anyone listed has taken the Pledge.',
			fields: [
				stringField(
					'field_noPledgedHeadline',
					'No pledged candidate: headline',
					POSITION_CONTENT_DEFAULTS.brandedCta.noPledgedHeadline,
					TOKEN_NOTE,
				),
				textField('field_noPledgedBody', 'No pledged candidate: body', POSITION_CONTENT_DEFAULTS.brandedCta.noPledgedBody, TOKEN_NOTE),
				stringField(
					'field_pledgedRunningHeadline',
					'Pledged candidate running: headline',
					POSITION_CONTENT_DEFAULTS.brandedCta.pledgedRunningHeadline,
					TOKEN_NOTE,
				),
				textField(
					'field_pledgedRunningBody',
					'Pledged candidate running: body',
					POSITION_CONTENT_DEFAULTS.brandedCta.pledgedRunningBody,
					TOKEN_NOTE,
				),
				stringField(
					'field_pledgedWonHeadline',
					'Pledged candidate won: headline',
					POSITION_CONTENT_DEFAULTS.brandedCta.pledgedWonHeadline,
					TOKEN_NOTE,
				),
				textField('field_pledgedWonBody', 'Pledged candidate won: body', POSITION_CONTENT_DEFAULTS.brandedCta.pledgedWonBody, TOKEN_NOTE),
				stringField(
					'field_noPledgedWonHeadline',
					'No pledged winner: headline',
					POSITION_CONTENT_DEFAULTS.brandedCta.noPledgedWonHeadline,
					TOKEN_NOTE,
				),
				textField('field_noPledgedWonBody', 'No pledged winner: body', POSITION_CONTENT_DEFAULTS.brandedCta.noPledgedWonBody, TOKEN_NOTE),
				stringField('field_buttonLabel', 'Button label', POSITION_CONTENT_DEFAULTS.brandedCta.buttonLabel),
				stringField('field_buttonHref', 'Button link', POSITION_CONTENT_LINKS.run, LINK_NOTE),
			],
		},
		{
			title: 'Voter readiness',
			name: 'voterReadiness',
			type: 'object',
			group: 'voterReadiness',
			description:
				'The three-column "Are you ready to vote" card. Leave the items empty to show the default three (registration, polling place, mail-in ballot).',
			fields: [
				stringField('field_title', 'Heading', POSITION_CONTENT_DEFAULTS.voterReadiness.title, TOKEN_NOTE),
				stringField('field_subtitle', 'Subheading', POSITION_CONTENT_DEFAULTS.voterReadiness.subtitle),
				{
					title: 'Items',
					name: 'list_voterLinks',
					type: 'array',
					description: 'Up to three. Leave empty for the defaults.',
					validation: (rule: { max(n: number): unknown }) => rule.max(3),
					of: [
						{
							title: 'Voter link',
							name: 'voterLink',
							type: 'object',
							fields: [
								{ title: 'Icon', name: 'field_icon', type: 'field_icon' },
								{ title: 'Heading', name: 'field_title', type: 'string' },
								{ title: 'Body', name: 'field_copy', type: 'text', rows: 2 },
								{ title: 'Link label', name: 'field_linkLabel', type: 'string' },
								{ title: 'Link', name: 'field_href', type: 'string', description: LINK_NOTE },
							],
							preview: { select: { title: 'field_title', subtitle: 'field_linkLabel' } },
						},
					],
				},
			],
		},
		{
			title: 'About the position',
			name: 'aboutPosition',
			type: 'object',
			group: 'aboutPosition',
			description: 'The description, salary, term and seat facts come from the race data per page; Sanity only names the section.',
			fields: [
				stringField('field_heading', 'Heading', POSITION_CONTENT_DEFAULTS.aboutPosition.heading, TOKEN_NOTE),
				stringField('field_cardTitle', 'Card title', POSITION_CONTENT_DEFAULTS.aboutPosition.cardTitle),
			],
		},
		{
			title: 'How to run',
			name: 'howToRun',
			type: 'object',
			group: 'howToRun',
			description: 'Steps 1 and 2 fill from the race data (eligibility and filing) and hide when a page has none. Step 3 is editorial.',
			fields: [
				stringField('field_heading', 'Heading', POSITION_CONTENT_DEFAULTS.howToRun.heading, TOKEN_NOTE),
				textField(
					'field_electionOverBanner',
					'"Election is over" banner',
					POSITION_CONTENT_DEFAULTS.howToRun.electionOverBanner,
					`Shown above the steps once the race is decided. ${TOKEN_NOTE}`,
				),
				stringField('field_step1Title', 'Step 1 title', POSITION_CONTENT_DEFAULTS.howToRun.step1Title),
				stringField('field_step2Title', 'Step 2 title', POSITION_CONTENT_DEFAULTS.howToRun.step2Title),
				stringField('field_step3Title', 'Step 3 title', POSITION_CONTENT_DEFAULTS.howToRun.step3Title),
				textField('field_step3Body', 'Step 3 body', POSITION_CONTENT_DEFAULTS.howToRun.step3Body, TOKEN_NOTE),
				stringField('field_step3ButtonLabel', 'Step 3 button label', POSITION_CONTENT_DEFAULTS.howToRun.step3ButtonLabel),
				stringField('field_step3ButtonHref', 'Step 3 button link', POSITION_CONTENT_LINKS.run, LINK_NOTE),
				textField(
					'field_needHelp',
					'"Need help?" line',
					POSITION_CONTENT_DEFAULTS.howToRun.needHelp,
					'The words "GoodParty.org Community" link to the community site automatically.',
				),
			],
		},
		{
			title: 'Design Settings',
			name: 'electionsPositionContentBlockDesignSettings',
			type: 'object',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'field_blockColorCreamMidnight',
				},
			],
			group: 'electionsPositionContentBlockDesignSettings',
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			type: 'componentSettings',
			group: 'componentSettings',
		},
	],
	preview: {
		select: {
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('FileText'),
				fallback: {
					previewTitle: '*Elections Position Content Block',
					previewSubTitle: '*Elections Position Content Block',
					title: 'Elections Position Content Block',
				},
			};
			const title = resolveValue('title', component_electionsPositionContentBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionsPositionContentBlock.preview.select, x);
			const media = resolveValue('media', component_electionsPositionContentBlock.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
	groups: [
		{ title: 'Side rail', name: 'siderail', icon: getIcon('Link') },
		{ title: 'People lists', name: 'lists', icon: getIcon('UserMultiple') },
		{ title: 'Branded CTA', name: 'brandedCta', icon: getIcon('Rocket') },
		{ title: 'Voter readiness', name: 'voterReadiness', icon: getIcon('Grid') },
		{ title: 'About the position', name: 'aboutPosition', icon: getIcon('Document') },
		{ title: 'How to run', name: 'howToRun', icon: getIcon('ListChecked') },
		{ title: 'Design Settings', name: 'electionsPositionContentBlockDesignSettings', icon: getIcon('ColorPalette') },
		{ title: 'Settings', name: 'componentSettings', icon: getIcon('Settings') },
	],
};
