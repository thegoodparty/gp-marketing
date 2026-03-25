'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn, tv } from './_lib/utils.ts';
import type { ComponentButtonProps } from './Inputs/Button.tsx';

import { Container } from './Container.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { Text } from './Text.tsx';
import { CandidatesCard } from './CandidatesCard.tsx';
import type { CandidatesCardProps } from './CandidatesCard.tsx';

const fadeInUp = {
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

const styles = tv({
	slots: {
		base: 'min-h-[100dvh] flex flex-col items-center justify-center text-center relative overflow-hidden',
		wrapper: 'relative z-1 flex flex-col items-center gap-6',
		badge:
			'inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full py-2 pl-3 pr-5 text-sm font-medium text-neutral-500',
		badgeDot: 'w-2 h-2 rounded-full bg-green-500 animate-pulse',
		logo: 'w-[8.75rem] h-[8.75rem]',
		title: 'max-w-[56.25rem]',
		subtitle: 'max-w-[40rem] text-neutral-500 text-body-xl',
		buttons: 'flex flex-wrap gap-4 justify-center',
		cardsRow: 'flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-4xl',
	},
});

export type ExperimentHeroCProps = {
	badgeText?: ReactNode;
	title?: ReactNode;
	subtitle?: string;
	buttons?: ComponentButtonProps[];
	candidates?: CandidatesCardProps[];
	className?: string;
};

export function ExperimentHeroC(props: ExperimentHeroCProps) {
	const { base, wrapper, badge, badgeDot, logo, title, subtitle, buttons, cardsRow } = styles();

	return (
		<article className={cn(base(), 'bg-goodparty-cream', props.className)} data-component='ExperimentHeroC'>
			<div className="absolute top-[-12.5rem] left-1/2 -translate-x-1/2 w-[56.25rem] h-[56.25rem] [background-image:var(--hero-glow-a)] rounded-full pointer-events-none" />
			<Container size="xl">
				<div className={wrapper()}>
					{props.badgeText && (
						<motion.div
							className={badge()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0 }}
						>
							<span className={badgeDot()} />
							<span>{props.badgeText}</span>
						</motion.div>
					)}
					<motion.div
						className={logo()}
						{...fadeInUp}
						transition={{ ...fadeInUp.transition, delay: 0.1 }}
					>
						<Logo width={140} height={140} className="w-full h-full drop-shadow-[var(--shadow-logo-glow)]" />
					</motion.div>
					{props.title && (
						<motion.div
							className={title()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0.2 }}
						>
							<Text as="h1" styleType="heading-xl">
								{props.title}
							</Text>
						</motion.div>
					)}
					{props.subtitle && (
						<motion.div
							className={subtitle()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0.3 }}
						>
							<Text as="p" styleType="body-xl">
								{props.subtitle}
							</Text>
						</motion.div>
					)}
					{props.buttons && props.buttons.length > 0 && (
						<motion.div
							className={buttons()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0.4 }}
						>
							{props.buttons.map((item, index) => (
								<ComponentButton
									key={index}
									className={cn(
										'max-sm:w-full w-fit',
										index === 0 && 'bg-goodparty-red hover:bg-goodparty-red/80 focus:ring-goodparty-red/40 shadow-[var(--shadow-cta-red)]',
									)}
									{...item}
									iconRight={
										index === 0 ? (
											<IconResolver icon="arrow-right" className="min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5" />
										) : undefined
									}
									buttonProps={{
										...(item.buttonProps ?? {}),
										styleType: index === 0 ? 'primary' : 'outline',
									}}
								/>
							))}
						</motion.div>
					)}
					{props.candidates && props.candidates.length > 0 && (
						<motion.div
							className={cardsRow()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0.5 }}
						>
							{props.candidates.map((candidate) => (
								<CandidatesCard
									key={candidate._key ?? candidate.name}
									{...candidate}
									className="flex-1 text-left"
								/>
							))}
						</motion.div>
					)}
				</div>
			</Container>
		</article>
	);
}
