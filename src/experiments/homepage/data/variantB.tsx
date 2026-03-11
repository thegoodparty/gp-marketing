import type { ComponentButtonProps } from '~/ui/Inputs/Button.tsx';
import type { StatProps } from '~/ui/Stat.tsx';
import type { TestimonialCardProps } from '~/ui/TestimonialCard.tsx';
import type { FeaturesBlockItemProps } from '~/ui/FeaturesBlock.tsx';
import type { HeaderBlockProps } from '~/ui/HeaderBlock.tsx';
import type { ThreePillarsPillar } from '~/ui/ThreePillarsBlock.tsx';

export const heroB = {
	manifesto: (
		<>
			We are here to <strong>rebuild America.</strong>
			<br />
			One election, one community,
			<br />
			one hero at a time.
		</>
	),
	title: (
		<>
			Good People x Great Tech =
			<br />
			<span className="text-[#E0162B]">Civic Heroes</span>
		</>
	),
	subtitle:
		'Good Party empowers people who love their community enough to run for it. You step up to serve — we step in to help you become a hometown hero!',
	buttons: [
		{
			buttonType: 'internal' as const,
			href: '/run',
			label: "I'm Ready to Run",
			buttonProps: { styleType: 'primary' as const },
		},
		{
			buttonType: 'internal' as const,
			href: '/candidates',
			label: 'I Want to Help',
			buttonProps: { styleType: 'outline-inverse' as const },
		},
	] as ComponentButtonProps[],
};

export const strikethroughB = {
	lines: ['No big money.', 'No party bosses.', 'No B.S.'],
	punchline: 'Just good people doing good for our communities.',
};

export const statsB: StatProps[] = [
	{ _key: '1', value: '6,700+', description: 'Good People Supported', color: 'midnight' },
	{ _key: '2', value: '3,400+', description: 'Winners Elected', color: 'midnight' },
	{ _key: '3', value: '50', description: 'States Reached', color: 'midnight' },
	{ _key: '4', value: '$0', description: 'From Corporate PACs', color: 'midnight' },
];

export const pillarsB: ThreePillarsPillar[] = [
	{
		label: 'We get you',
		color: 'red',
		title: 'Good Party is for people who love their community enough to run for it.',
		description:
			"This isn't about abstract politics — it's about your kids, your neighborhood, your town. You believe better is possible, and you're willing to step up to make it happen.",
	},
	{
		label: "We've got you",
		color: 'blue',
		title: 'You step up to serve your community. We step up for you.',
		description:
			'Good Party is a shoulder to lean on for people who step up because someone had to. We give you someone to reach out to — advisors, community, and tools that make it feel possible and professional.',
	},
	{
		label: "We've got the goods",
		color: 'gold',
		title: 'Serious political operations on neighborhood budgets.',
		description:
			'We connect you with volunteers, funding, voter data, and professional guidance to become an elected official who actually works for the people — without needing party machines or big money.',
	},
];

export const pillarsHeaderB: HeaderBlockProps = {
	title: "We get you. We've got you. We've got the goods.",
	copy: "Good Party has the voice of an older sibling you always wished you had. We're the champion coach in your corner — every step of the way.",
};

export const peopleHeaderB: HeaderBlockProps = {
	label: 'Good People',
	title: 'Meet the good people already changing their communities.',
	copy: "They're teachers, small business owners, nurses, and neighbors. They're not career politicians — they stepped up because someone had to.",
};

export const peopleB: TestimonialCardProps[] = [
	{
		author: {
			name: 'Maria Gonzalez',
			meta: ['City Council — Austin, TX'],
		},
		copy: 'I love this place too much to sit out. My neighbors asked me to run, and Good Party gave me the tools to actually do it — without selling out to anyone.',
		color: 'midnight',
	},
	{
		author: {
			name: 'James Chen',
			meta: ['School Board — Portland, OR'],
		},
		copy: "Nobody else was running. Somebody needed to do it. Good Party made it feel possible — even for someone who'd never run for anything before.",
		color: 'midnight',
	},
	{
		author: {
			name: 'Aisha Williams',
			meta: ['County Commissioner — Fulton, GA'],
		},
		copy: "I left both major parties because they'd been bought and sold. Good Party gave me the infrastructure to win as an Independent. For real.",
		color: 'midnight',
	},
];

export const techHeaderB: HeaderBlockProps = {
	label: 'Great Tech',
	title: 'Superpowers for Good People.',
	copy: 'We make Great Tech that gives Good People superpowers to run for office, win races, and serve their community — without big money or major party backing.',
};

export const techB: FeaturesBlockItemProps[] = [
	{
		title: 'Human-Centric',
		description:
			'Usability above all. Approachable enough for a first-time candidate, powerful enough for a seasoned campaigner.',
	},
	{
		title: 'AI-Forward',
		description:
			'Smart campaign tools that do the heavy lifting — voter analysis, content creation, outreach — so you can focus on your community.',
	},
	{
		title: 'Empowering & Affordable',
		description:
			'Professional-grade political tools at a fraction of the cost. Because running for office shouldn\'t require a fortune.',
	},
];

export const toolsHeaderB: HeaderBlockProps = {
	label: 'The Goods',
	title: 'Tools and guidance to run, win, and serve your community in a whole new way.',
};

export const toolsB: FeaturesBlockItemProps[] = [
	{
		title: 'Custom Campaign Plan',
		description:
			'AI-generated strategy tailored to your district, your race, and your resources. Like having a political consultant in your pocket.',
	},
	{
		title: 'Voter Data & Insights',
		description:
			'Detailed voter files, demographic breakdowns, and turnout history — data that used to be paywalled and reserved for party insiders.',
	},
	{
		title: 'Outreach & GOTV',
		description: 'Text banking, door knocking tools, and robocall campaigns to reach voters where they are — at a fraction of the usual cost.',
	},
	{
		title: 'AI Content Builder',
		description: 'Campaign websites, social posts, mailers, and more — generated in seconds using dozens of professional templates.',
	},
	{
		title: 'Training & Community',
		description: 'Step-by-step campaign training, live events, and a community of fellow Good People to learn from and lean on.',
	},
	{
		title: 'Serve in Office',
		description: "The tools don't stop at the election. We help you govern effectively — because winning is just the beginning.",
	},
];

export const ctaB = {
	title: 'Run independent, not alone.',
	copy: "We get you, we've got your back, and we've got the goods. Every step of the way.",
	buttons: [
		{
			buttonType: 'internal' as const,
			href: '/run',
			label: 'Start Your Campaign',
			buttonProps: { styleType: 'primary' as const },
		},
		{
			buttonType: 'internal' as const,
			href: '/candidates',
			label: 'Explore the Tools',
			buttonProps: { styleType: 'outline-inverse' as const },
		},
	] as ComponentButtonProps[],
};
