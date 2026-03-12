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
		logo: 'flex flex-col items-center gap-2 mb-10',
		logoIcon: 'w-[6.25rem] h-[6.25rem]',
		logoText: 'text-xs text-white/60 font-medium tracking-wide',
		manifesto: 'max-w-[50rem]',
		manifestoText: 'text-[44px]  font-normal leading-[1.4]',
		title: 'max-w-[56.25rem] mt-12 [&_h1]:font-black [&_h1]:tracking-[-0.125rem] [&_h1]:leading-[1.1] [&_h1]:text-[clamp(2.25rem,5vw,4rem)]',
		subtitle: 'max-w-[36.25rem]',
		subtitleText: 'text-[clamp(1.0625rem,2vw,1.25rem)] text-white/55 leading-[1.6]',
		buttons: 'flex flex-wrap gap-4 justify-center mt-12',
	},
});

export type ExperimentHeroBProps = {
	manifesto?: ReactNode;
	title?: ReactNode;
	subtitle?: string;
	buttons?: ComponentButtonProps[];
	className?: string;
};

export function ExperimentHeroB(props: ExperimentHeroBProps) {
	const { base, wrapper, logo, logoIcon, logoText, manifesto, manifestoText, title, subtitle, subtitleText, buttons } =
		styles();

	return (
		<article className={cn(base(), 'bg-midnight-900 text-white', props.className)} data-component='ExperimentHeroB'>
			<div className="absolute top-[-12.5rem] left-1/2 -translate-x-1/2 w-[56.25rem] h-[56.25rem] bg-[radial-gradient(circle,rgba(224,22,43,0.08)_0%,rgba(0,82,165,0.05)_40%,transparent_70%)] rounded-full pointer-events-none" />
			<Container size="xl">
				<div className={wrapper()}>
					<motion.div
						className={logo()}
						{...fadeInUp}
						transition={{ ...fadeInUp.transition, delay: 0 }}
					>
						<Logo width={100} height={100} className={cn(logoIcon(), 'drop-shadow-[0_4px_24px_rgba(224,22,43,0.3)]')} />
						<div className={logoText()}>
							<div>GoodParty.org</div>
							<div>Bright-Hearted Star</div>
						</div>
					</motion.div>
					{props.manifesto && (
						<motion.div
							className={manifesto()}
							{...fadeInUp}
							transition={{ ...fadeInUp.transition, delay: 0.1 }}
						>
							<p className={manifestoText()}>{props.manifesto}</p>
						</motion.div>
					)}
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
							<p className={subtitleText()}>{props.subtitle}</p>
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
										'max-sm:w-full w-fit text-[1.0625rem] font-bold py-[1.125rem] px-[2.25rem]',
										index === 0 && 'bg-[#E0162B] hover:bg-[#E0162B]/80 focus:ring-[#E0162B]/40',
									)}
									{...item}
									iconRight={
										index === 0 ? (
											<IconResolver icon="arrow-right" className="min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5" />
										) : undefined
									}
									buttonProps={{
										...(item.buttonProps ?? {}),
										styleType: index === 0 ? 'primary' : 'outline-inverse',
									}}
								/>
							))}
						</motion.div>
					)}
				</div>
			</Container>
		</article>
	);
}
