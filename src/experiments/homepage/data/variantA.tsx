import { IconResolver } from '~/ui/IconResolver.tsx';
import type { ComponentButtonProps } from '~/ui/Inputs/Button.tsx';
import type { StatProps } from '~/ui/Stat.tsx';
import type { TestimonialCardProps } from '~/ui/TestimonialCard.tsx';
import type { FeaturesBlockItemProps } from '~/ui/FeaturesBlock.tsx';
import type { HeaderBlockProps } from '~/ui/HeaderBlock.tsx';
import type { AIPlatformPillar } from '~/ui/AIPlatformSection.tsx';
import type { AIChatMessage } from '~/ui/AIChatVisual.tsx';
import {
	midnightComponentColor,
	outlineButtonStyleType,
	outlineInverseButtonStyleType,
	primaryButtonStyleType,
} from '~/ui/_lib/designTypesStore.ts';
import { HOMEPAGE_EXPERIMENT_VARIANT_A, trackEvent } from '~/lib/analytics';

export const heroA = {
	badgeText: (
		<>
			<strong>3,400+ winners</strong> and counting across all 50 states
		</>
	),
	title: (
		<>
			Not Elephants, nor Donkeys.
			<br />
			<span className="text-neutral-500 font-semibold">built to empower</span>
			<br />
			<span className="text-goodparty-red">We the People.</span>
		</>
	),
	subtitle:
		'GoodParty.org empowers Independents to run, win, and serve their communities — powered by ethical AI, funded by people, free from party machines.',
	buttons: [
		{
			buttonType: 'internal' as const,
			href: '/run-for-office',
			label: "I'm Ready to Run",
			onClick: () => {
				trackEvent('Homepage CTA Clicked', {
					variant: HOMEPAGE_EXPERIMENT_VARIANT_A,
					section: 'hero',
					label: "I'm Ready to Run",
					href: '/run-for-office',
				});
			},
			buttonProps: { styleType: primaryButtonStyleType },
		},
		{
			buttonType: 'internal' as const,
			href: '/about',
			label: 'I Want to Help',
			onClick: () => {
				trackEvent('Homepage CTA Clicked', {
					variant: HOMEPAGE_EXPERIMENT_VARIANT_A,
					section: 'hero',
					label: 'I Want to Help',
					href: '/about',
				});
			},
			buttonProps: { styleType: outlineButtonStyleType },
		},
	] as ComponentButtonProps[],
};

export const statsA: StatProps[] = [
	{ _key: '1', value: '17,000+', description: 'Good People Supported', color: midnightComponentColor },
	{ _key: '2', value: '13,000+', description: 'Winners Elected', color: midnightComponentColor },
	{ _key: '3', value: '50', description: 'States Reached', color: midnightComponentColor },
	{ _key: '4', value: '$0', description: 'From Corporate PACs', color: midnightComponentColor },
];

export const problemA = {
	title: 'Americans deserve more choices at the ballot box.',
	paragraphs: [
		'Over half of Americans now identify as Independent. Yet our elections are still dominated by two parties — leaving tens of millions of people feeling unrepresented.',
		'GoodParty.org believes we can transform this — not by tearing down the system, but by empowering more good people to compete in it. When Independents run, everybody wins.',
	],
};

export const heroesHeaderA: HeaderBlockProps = {
	label: 'Civic Heroes',
	title: 'Real people stepping up to serve their communities.',
	copy: 'Every Independent who decides to run, win, and serve is a Civic Hero. Here are some of them.',
};

export const heroesA: TestimonialCardProps[] = [
	{
		author: {
			name: 'Maria Gonzalez',
			meta: ['City Council — Austin, TX'],
		},
		avatar: '👩‍🏫',
		copy: 'I was a teacher who got tired of waiting for someone else to fix things. GoodParty.org gave me the tools to run — and win — without owing anyone.',
		color: midnightComponentColor,
	},
	{
		author: {
			name: 'James Chen',
			meta: ['School Board — Portland, OR'],
		},
		avatar: '👨‍💼',
		copy: 'As a small business owner, I knew our school board needed someone who actually lives in the community. The AI campaign tools made it possible.',
		color: midnightComponentColor,
	},
	{
		author: {
			name: 'Aisha Williams',
			meta: ['County Commissioner — Fulton, GA'],
		},
		avatar: '👩‍⚖️',
		copy: 'People told me I needed a party behind me. I told them I had something better — the support of my neighbors and the right tools.',
		color: midnightComponentColor,
	},
];

export const aiPlatformHeaderA: HeaderBlockProps = {
	label: 'Ethical AI',
	title: 'AI that serves people, not profit.',
	copy: 'Our AI campaign tools are built differently. Open, transparent, and designed to empower — never to manipulate. Every tool is verifiably anti-corruption because your campaign should answer to voters, not algorithms.',
};

export const aiPlatformPillarsA: AIPlatformPillar[] = [
	{
		icon: '🔓',
		title: 'Open & Transparent',
		description: 'Our AI models and methods are documented and auditable. No black boxes, no hidden agendas.',
	},
	{
		icon: '🤝',
		title: 'Human-Empowering',
		description: 'AI that amplifies your voice and judgment — never replaces it. You stay in control.',
	},
	{
		icon: '🛡️',
		title: 'Verifiably Anti-Corruption',
		description: 'Built from the ground up to resist manipulation. Your campaign answers to voters, not algorithms.',
	},
];

export const aiChatMessagesA: AIChatMessage[] = [
	{
		role: 'user',
		text: "I'm running for city council. What should my first 30 days look like?",
	},
	{
		role: 'ai',
		name: 'GP Campaign Assistant',
		text: "Great question! Here's a starter plan: Week 1 — finalize your platform and recruit a core team. Week 2–3 — door-knock in high-turnout precincts. Week 4 — launch your first digital ad. I can generate a full 90-day plan tailored to your district. Want me to pull voter data first?",
	},
	{
		role: 'user',
		text: 'Yes, and can you draft a short bio for my website?',
	},
	{
		role: 'ai',
		name: 'GP Campaign Assistant',
		text: "On it. I'll use your district's demographics and your stated priorities to draft something that resonates. You'll have a bio and a sample website section in about 2 minutes.",
	},
];

export const toolsHeaderA: HeaderBlockProps = {
	label: 'Campaign Toolkit',
	title: 'Everything you need to run, win, and serve.',
};

export const toolsA: FeaturesBlockItemProps[] = [
	{
		iconContent: '📋',
		iconColor: 'red',
		title: 'Custom Campaign Plan',
		description:
			'AI-generated campaign strategy tailored to your district, your race, and your resources. No consultants needed.',
		tag: 'Free',
		tagVariant: 'free',
	},
	{
		iconContent: '📊',
		iconColor: 'blue',
		title: 'Voter Data & Insights',
		description:
			'Access detailed voter files, demographic breakdowns, and turnout history — data that used to cost thousands.',
		tag: 'Free',
		tagVariant: 'free',
	},
	{
		iconContent: '✉️',
		iconColor: 'gold',
		title: 'Outreach & GOTV',
		description: 'Text banking, door knocking tools, and robocall campaigns to reach voters where they are.',
		tag: 'From $10/mo',
		tagVariant: 'default',
	},
	{
		iconContent: '🎨',
		iconColor: 'red',
		title: 'AI Content Builder',
		description: 'Dozens of campaign templates — from websites to social posts to mailers — generated in seconds.',
		tag: 'Free',
		tagVariant: 'free',
	},
	{
		iconContent: '🎓',
		iconColor: 'blue',
		title: 'Training & Community',
		description: 'Step-by-step campaign training, live events, and a community of fellow Civic Heroes to learn from.',
		tag: 'Free',
		tagVariant: 'free',
	},
	{
		iconContent: '🏛️',
		iconColor: 'gold',
		title: 'Serve in Office',
		description:
			'The tools don\'t stop at the election. We help you serve effectively once you win — because governing matters too.',
		tag: 'Coming Soon',
		tagVariant: 'default',
	},
];

export const ctaA = {
	title: 'Your community needs a Civic Hero. It might be you.',
	copy: 'No big-money backers required. No party strings attached. Just you, your neighbors, and the tools to make it happen.',
	buttons: [
		{
			buttonType: 'internal' as const,
			href: '/run',
			label: 'Start Your Campaign',
			className: 'max-sm:w-full bg-goodparty-red hover:bg-goodparty-red/80 focus:ring-goodparty-red/40 shadow-[var(--shadow-cta-red)]',
			iconRight: <IconResolver icon="arrow-right" className="min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5" />,
			onClick: () => {
				trackEvent('Homepage CTA Clicked', {
					variant: HOMEPAGE_EXPERIMENT_VARIANT_A,
					section: 'cta_block',
					label: 'Start Your Campaign',
					href: '/run',
				});
			},
			buttonProps: { styleType: primaryButtonStyleType },
		},
		{
			buttonType: 'internal' as const,
			href: '/candidates',
			label: 'Explore the Tools',
			onClick: () => {
				trackEvent('Homepage CTA Clicked', {
					variant: HOMEPAGE_EXPERIMENT_VARIANT_A,
					section: 'cta_block',
					label: 'Explore the Tools',
					href: '/candidates',
				});
			},
			buttonProps: { styleType: outlineInverseButtonStyleType },
		},
	] as ComponentButtonProps[],
};
