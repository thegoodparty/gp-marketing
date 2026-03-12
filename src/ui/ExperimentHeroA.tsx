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
		symbolsRow: 'flex items-center gap-10 mt-[4.5rem]',
		oldSymbol: 'opacity-15 grayscale inline-flex items-center justify-center w-[60px] h-[57px] text-[3.5rem] leading-none',
		vsText: 'text-sm font-bold text-neutral-500 uppercase tracking-[0.2em]',
		newSymbol: 'relative',
	},
});

export type ExperimentHeroAProps = {
	badgeText?: ReactNode;
	title?: ReactNode;
	subtitle?: string;
	buttons?: ComponentButtonProps[];
	className?: string;
};

export function ExperimentHeroA(props: ExperimentHeroAProps) {
	const { base, wrapper, badge, badgeDot, logo, title, subtitle, buttons, symbolsRow, oldSymbol, vsText, newSymbol } =
		styles();

	return (
		<article className={cn(base(), 'bg-goodparty-cream', props.className)} data-component='ExperimentHeroA'>
			<div className="absolute top-[-12.5rem] left-1/2 -translate-x-1/2 w-[56.25rem] h-[56.25rem] bg-[radial-gradient(circle,var(--goodparty-red)/0.06_0%,var(--goodparty-blue)/0.04_40%,transparent_70%)] rounded-full pointer-events-none" />
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
						<Logo width={140} height={140} className="w-full h-full drop-shadow-[0_8px_32px_var(--goodparty-red)/0.2]" />
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
					<motion.div
						className={symbolsRow()}
						{...fadeInUp}
						transition={{ ...fadeInUp.transition, delay: 0.5 }}
					>
						<span className={oldSymbol()}>🐘</span>
						<span className={vsText()}>vs</span>
						<span className={oldSymbol()}>🫏</span>
						<span className={vsText()}>vs</span>
						<div className={cn(newSymbol(), 'after:content-[""] after:absolute after:inset-[-0.5rem] after:rounded-full after:border-2 after:border-goodparty-gold after:animate-pulse-ring')}>
							<Logo width={56} height={56} className="drop-shadow-[0_8px_32px_var(--goodparty-red)/0.2]" />
						</div>
					</motion.div>
				</div>
			</Container>
		</article>
	);
}
