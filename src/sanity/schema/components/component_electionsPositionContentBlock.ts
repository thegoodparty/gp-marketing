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
	community: 'https://community.goodparty.org',
	voterRegistration: '/check-voter-registration',
	pollingPlace: '/find-polling-place',
	mailBallot: '/request-mail-in-ballot',
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
	},
	pledgeExplainer: {
		title: 'What this symbol means',
		body: 'Candidates and elected officials with this symbol took the GoodParty.org Pledge, promising to serve people first, independent of both major parties and big-money interests.',
		linkLabel: 'Read the full pledge',
	},
	peopleLists: {
		candidatesHeading: 'Candidates for [office name]',
		candidatesIntro: 'Learn about candidates who have filed to run for [office name].',
		resultsHeading: 'Results for [office name]',
		officeholdersHeading: "Who's currently in office",
		officeholdersIntro: 'Learn about who represents you in [County or City].',
		showMoreLabel: 'See more candidates',
	},
	voterReadiness: {
		title: "Are you ready for [County or City]'s next election?",
		subtitle: 'Get registered and ready to vote, whether in person or by mail.',
		items: [
			{
				key: 'registration',
				title: 'Check your voter registration',
				copy: 'Verify your voter registration in under a minute.',
				buttonLabel: 'Check my registration',
				href: POSITION_CONTENT_LINKS.voterRegistration,
			},
			{
				key: 'polling',
				title: 'Find your polling location',
				copy: 'Learn where to go to vote in person.',
				buttonLabel: 'Find my polling place',
				href: POSITION_CONTENT_LINKS.pollingPlace,
			},
			{
				key: 'mail',
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
		'The body of a Position Page below the hero: the side rail (desktop only), the candidate and officeholder lists with their pledge explainers, the voter readiness links, the About card and the How to run steps. Its state follows the hero (filing, mid-election, decided) from the race data, never by hand: before the filing window opens the About card and the How to run steps move to the top. The data-fed sections (candidates, officeholders, About, the eligibility and filing steps, the explore card) hide on any page with no data for them; the editorial sections (voter readiness, the launch step) always show. Sanity controls the copy and the design settings; every field has a default.',
	type: 'object',
	icon: getIcon('FileText'),
	fields: [
		{
			title: 'Side rail',
			name: 'siderail',
			type: 'object',
			group: 'siderail',
			description: 'Shown beside the content on desktop only; phones and tablets hide the rail.',
			fields: [
				stringField('field_onThisPageTitle', '"On this page" title', POSITION_CONTENT_DEFAULTS.siderail.onThisPageTitle),
				stringField('field_exploreTitle', 'Explore card title', POSITION_CONTENT_DEFAULTS.siderail.exploreTitle, TOKEN_NOTE),
				textField(
					'field_exploreBody',
					'Explore card body',
					POSITION_CONTENT_DEFAULTS.siderail.exploreBody,
					`The words "GoodParty.org Pledge" open the pledge pop-up automatically. ${TOKEN_NOTE}`,
				),
				stringField(
					'field_exploreButtonLabel',
					'Explore card button label',
					POSITION_CONTENT_DEFAULTS.siderail.exploreButtonLabel,
					TOKEN_NOTE,
				),
			],
		},
		{
			title: 'Pledge explainer',
			name: 'pledgeExplainer',
			type: 'object',
			group: 'lists',
			description:
				'The blue box explaining the heart and star symbol, shown at the top of the candidates list and of the officeholders list. Its link opens the pledge pop-up.',
			fields: [
				stringField('field_title', 'Title', POSITION_CONTENT_DEFAULTS.pledgeExplainer.title),
				textField(
					'field_body',
					'Body',
					POSITION_CONTENT_DEFAULTS.pledgeExplainer.body,
					'The words "GoodParty.org Pledge" are shown in bold automatically.',
				),
				{
					title: 'Show pledge link',
					name: 'field_showPledgeLink',
					type: 'boolean',
					initialValue: true,
					description: 'The link at the end of the explainer that opens the pledge pop-up.',
				},
				stringField(
					'field_linkLabel',
					'Link label',
					POSITION_CONTENT_DEFAULTS.pledgeExplainer.linkLabel,
					'Only shown when the pledge link is on.',
				),
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
					'field_candidatesIntro',
					'Candidates intro',
					POSITION_CONTENT_DEFAULTS.peopleLists.candidatesIntro,
					`The sentence under the candidates heading. ${TOKEN_NOTE}`,
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
				stringField(
					'field_officeholdersIntro',
					'Officeholders intro',
					POSITION_CONTENT_DEFAULTS.peopleLists.officeholdersIntro,
					`The sentence under the officeholders heading. ${TOKEN_NOTE}`,
				),
				stringField('field_showMoreLabel', '"See more" button label', POSITION_CONTENT_DEFAULTS.peopleLists.showMoreLabel),
			],
		},
		{
			title: 'Voter readiness',
			name: 'voterReadiness',
			type: 'object',
			group: 'voterReadiness',
			description:
				'The three-column "Are you ready to vote" card. Leave the items empty to show the default three (registration, polling place, mail-in ballot), which link to the matching pages on this site and carry no illustration until items with images are added here.',
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
								{
									title: 'Illustration',
									name: 'img_image',
									type: 'img_image',
									description: 'Shown at 64px square on desktop and 112px on phones, so upload a square image with a transparent background.',
								},
								{ title: 'Heading', name: 'field_title', type: 'string' },
								{ title: 'Body', name: 'field_copy', type: 'text', rows: 2 },
								{ title: 'Link label', name: 'field_linkLabel', type: 'string' },
								{ title: 'Link', name: 'field_href', type: 'string', description: LINK_NOTE },
							],
							preview: { select: { title: 'field_title', subtitle: 'field_linkLabel', media: 'img_image' } },
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
		{ title: 'Voter readiness', name: 'voterReadiness', icon: getIcon('Grid') },
		{ title: 'About the position', name: 'aboutPosition', icon: getIcon('Document') },
		{ title: 'How to run', name: 'howToRun', icon: getIcon('ListChecked') },
		{ title: 'Design Settings', name: 'electionsPositionContentBlockDesignSettings', icon: getIcon('ColorPalette') },
		{ title: 'Settings', name: 'componentSettings', icon: getIcon('Settings') },
	],
};
