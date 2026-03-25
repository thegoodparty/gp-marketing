import { IconResolver } from '~/ui/IconResolver.tsx';
import type { ComponentButtonProps } from '~/ui/Inputs/Button.tsx';
import type { CandidatesCardProps } from '~/ui/CandidatesCard.tsx';
import {
	outlineButtonStyleType,
	primaryButtonStyleType,
} from '~/ui/_lib/designTypesStore.ts';

export const heroC = {
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
			buttonProps: { styleType: primaryButtonStyleType },
		},
		{
			buttonType: 'internal' as const,
			href: '/about',
			label: 'I Want to Help',
			buttonProps: { styleType: outlineButtonStyleType },
		},
	] as ComponentButtonProps[],
	candidates: [
		{
			_key: 'c1',
			name: 'Alex Rivera',
			partyAffiliation: 'Independent · City Council · Austin, TX',
			href: '/candidates',
			isGoodPartyCandidate: true,
		},
		{
			_key: 'c2',
			name: 'Jordan Kim',
			partyAffiliation: 'Independent · School Board · Portland, OR',
			href: '/candidates',
			isGoodPartyCandidate: true,
		},
		{
			_key: 'c3',
			name: 'Sam Okafor',
			partyAffiliation: 'Independent · County Commissioner · Atlanta, GA',
			href: '/candidates',
			isGoodPartyCandidate: true,
		},
	] as CandidatesCardProps[],
};
