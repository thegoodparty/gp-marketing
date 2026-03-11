import type { HeaderBlockProps } from './HeaderBlock.tsx';
import type { AIChatMessage } from './AIChatVisual.tsx';

import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { AIChatVisual } from './AIChatVisual.tsx';
import { FadeIn } from './FadeIn.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: '',
		grid: 'grid gap-20 md:grid-cols-2 md:gap-20 items-center',
		text: '',
		label: 'inline-block bg-[rgba(0,82,165,0.08)] text-[#0052A5] py-2 px-5 rounded-full text-sm font-semibold uppercase tracking-wider mb-6',
		title: 'text-heading-lg font-black leading-tight tracking-tight text-midnight-900 mb-6',
		copy: 'text-lg leading-[1.7] text-neutral-500 mb-8',
		pillars: 'flex flex-col gap-4',
		pillar: 'flex items-start gap-4 p-5 pt-5 pr-6 bg-white rounded-2xl border border-neutral-200 transition-all hover:border-[#0052A5] hover:shadow-[0_4px_20px_rgba(0,82,165,0.08)]',
		pillarIcon: 'w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(0,82,165,0.1)] to-[rgba(224,22,43,0.1)] flex items-center justify-center text-xl flex-shrink-0',
		pillarTitle: 'text-base font-bold text-midnight-900 mb-1',
		pillarDesc: 'text-sm text-neutral-500 leading-[1.5]',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'py-(--container-padding) bg-goodparty-cream',
			},
		},
	},
});

export type AIPlatformPillar = {
	icon: string;
	title: string;
	description: string;
};

export type AIPlatformSectionProps = {
	header: HeaderBlockProps;
	pillars: AIPlatformPillar[];
	chatMessages: AIChatMessage[];
	backgroundColor?: 'cream';
	className?: string;
};

export function AIPlatformSection(props: AIPlatformSectionProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, text, label, title, copy, pillars, pillar, pillarIcon, pillarTitle, pillarDesc } = styles({
		backgroundColor,
	});

	return (
		<article className={cn(base(), props.className)} data-component="AIPlatformSection">
			<Container size="xl">
				<div className={grid()}>
					<FadeIn delay={0}>
						<div className={text()}>
						{props.header.label && (
							<span className={label()}>{props.header.label}</span>
						)}
						{props.header.title && (
							<Text as="h2" styleType="heading-lg" className={title()}>
								{props.header.title}
							</Text>
						)}
						{props.header.copy && (
							<Text as="p" styleType="body-1" className={copy()}>
								{props.header.copy}
							</Text>
						)}
						<div className={pillars()}>
							{props.pillars.map((p, i) => (
								<div key={i} className={pillar()}>
									<div className={pillarIcon()}>{p.icon}</div>
									<div>
										<h4 className={pillarTitle()}>{p.title}</h4>
										<p className={pillarDesc()}>{p.description}</p>
									</div>
								</div>
							))}
						</div>
						</div>
					</FadeIn>
					<FadeIn delay={100}>
						<AIChatVisual messages={props.chatMessages} />
					</FadeIn>
				</div>
			</Container>
		</article>
	);
}
