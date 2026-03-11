import type { HeaderBlockProps } from './HeaderBlock.tsx';

import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { HeaderBlock } from './HeaderBlock.tsx';
import { Text } from './Text.tsx';

const pillarStyles = tv({
	slots: {
		card: 'p-12 md:p-9 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
		label: 'text-[0.8125rem] font-bold uppercase tracking-[0.125rem] mb-5',
		title: 'text-text-3xl font-black text-midnight-900 tracking-[-0.02em] leading-tight mb-4',
		description: 'text-base leading-[1.7] text-neutral-500',
	},
	variants: {
		color: {
			red: {
				card: 'bg-gradient-to-b from-[rgba(224,22,43,0.04)] to-transparent border-[rgba(224,22,43,0.15)]',
				label: 'text-[#E0162B]',
			},
			blue: {
				card: 'bg-gradient-to-b from-[rgba(0,82,165,0.04)] to-transparent border-[rgba(0,82,165,0.15)]',
				label: 'text-[#0052A5]',
			},
			gold: {
				card: 'bg-gradient-to-b from-[rgba(232,170,26,0.04)] to-transparent border-[rgba(232,170,26,0.15)]',
				label: 'text-[#E8AA1A]',
			},
		},
	},
});

export type ThreePillarsPillar = {
	label: string;
	color: 'red' | 'blue' | 'gold';
	title: string;
	description: string;
};

export type ThreePillarsBlockProps = {
	header: HeaderBlockProps;
	pillars: ThreePillarsPillar[];
	className?: string;
};

export function ThreePillarsBlock(props: ThreePillarsBlockProps) {
	return (
		<article className={cn('py-(--container-padding) bg-white', props.className)} data-component='ThreePillarsBlock'>
			<Container size="xl">
				<div className="flex flex-col gap-[4.5rem]">
					<div className="text-center">
						<HeaderBlock {...props.header} backgroundColor="cream" layout="center" />
					</div>
					<div className="grid gap-8 md:grid-cols-3">
						{props.pillars.map((pillar, i) => {
							const { card, label, title, description } = pillarStyles({ color: pillar.color });
							return (
								<div key={i} className={card()}>
									<div className={label()}>{pillar.label}</div>
									<Text as="h3" styleType="heading-sm" className={cn(title(), '!font-black')}>
										{pillar.title}
									</Text>
									<Text as="p" styleType="body-2" className={description()}>
										{pillar.description}
									</Text>
								</div>
							);
						})}
					</div>
				</div>
			</Container>
		</article>
	);
}
