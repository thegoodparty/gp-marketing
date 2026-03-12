import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { FadeIn } from './FadeIn.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding) bg-white',
		grid: 'grid gap-20 md:grid-cols-2 md:gap-20 items-center',
		text: '',
		title: 'text-heading-lg font-black leading-tight tracking-tight text-midnight-900 mb-6',
		paragraph: 'text-lg leading-[1.7] text-neutral-500 mb-4',
		visual: 'relative flex items-center justify-center h-[25rem]',
		partyIcon: 'w-[7.5rem] h-[7.5rem] rounded-full flex items-center justify-center text-[4.5rem] leading-none relative',
		partyIconFaded: 'bg-neutral-100 opacity-50 grayscale after:content-[""] after:absolute after:w-[140%] after:h-[3px] after:bg-[#E0162B] after:rotate-[-45deg] after:opacity-60',
		partyIconStar: 'w-[10rem] h-[10rem] bg-gradient-to-br from-red-50 to-white border-[3px] border-[#E0162B] shadow-[0_12px_48px_rgba(224,22,43,0.15)] z-[2] -mx-5 [animation:float_6s_ease-in-out_infinite]',
	},
});

export type DuopolyProblemBlockProps = {
	title: string;
	paragraphs: string[];
	className?: string;
};

export function DuopolyProblemBlock(props: DuopolyProblemBlockProps) {
	const { base, grid, text, title, paragraph, visual, partyIcon, partyIconFaded, partyIconStar } = styles();

	return (
		<article className={cn(base(), props.className)} data-component='DuopolyProblemBlock'>
			<Container size="xl">
				<div className={grid()}>
					<FadeIn delay={0}>
						<div className={text()}>
							<Text as="h2" styleType="heading-lg" className={title()}>
								{props.title}
							</Text>
							{props.paragraphs.map((p, i) => (
								<Text key={i} as="p" styleType="body-1" className={paragraph()}>
									{p}
								</Text>
							))}
						</div>
					</FadeIn>
					<FadeIn delay={0.1}>
						<div className={visual()}>
							<div className={cn(partyIcon(), partyIconFaded())}>🐘</div>
							<div className={cn(partyIcon(), partyIconStar())}>
								<Logo width={72} height={72} />
							</div>
							<div className={cn(partyIcon(), partyIconFaded())}>🫏</div>
						</div>
					</FadeIn>
				</div>
			</Container>
		</article>
	);
}
