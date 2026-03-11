import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { ComponentButtonProps } from './Inputs/Button.tsx';

import { Container } from './Container.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'min-h-[100dvh] flex flex-col items-center justify-center text-center relative overflow-hidden',
		wrapper: 'relative z-1 flex flex-col items-center gap-6',
		logo: 'w-[6.25rem] h-[6.25rem] mb-10',
		manifesto: 'max-w-[50rem] text-[rgba(255,255,255,0.85)] text-body-xl font-normal',
		title: 'max-w-[56.25rem] mt-12',
		subtitle: 'max-w-[36.25rem] text-white/55 text-body-xl',
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
	const { base, wrapper, logo, manifesto, title, subtitle, buttons } = styles();

	return (
		<article className={cn(base(), 'bg-midnight-900 text-white', props.className)} data-component='ExperimentHeroB'>
			<div className="absolute top-[-12.5rem] left-1/2 -translate-x-1/2 w-[56.25rem] h-[56.25rem] bg-[radial-gradient(circle,rgba(224,22,43,0.08)_0%,rgba(0,82,165,0.05)_40%,transparent_70%)] rounded-full pointer-events-none" />
			<Container size="xl">
				<div className={wrapper()}>
					<div className={logo()}>
						<Logo width={100} height={100} className="w-full h-full drop-shadow-[0_4px_24px_rgba(224,22,43,0.3)]" />
					</div>
					{props.manifesto && (
						<Text as="p" styleType="body-xl" className={manifesto()}>
							{props.manifesto}
						</Text>
					)}
					{props.title && (
						<Text as="h1" styleType="heading-xl" className={title()}>
							{props.title}
						</Text>
					)}
					{props.subtitle && (
						<Text as="p" styleType="body-xl" className={subtitle()}>
							{props.subtitle}
						</Text>
					)}
					{props.buttons && props.buttons.length > 0 && (
						<div className={buttons()}>
							{props.buttons.map((item, index) => (
								<ComponentButton
									key={index}
									className="max-sm:w-full w-fit"
									{...item}
									buttonProps={{
										...(item.buttonProps ?? {}),
										styleType: index === 0 ? 'primary' : 'outline-inverse',
									}}
								/>
							))}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
