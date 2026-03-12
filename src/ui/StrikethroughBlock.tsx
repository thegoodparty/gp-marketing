import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { FadeIn } from './FadeIn.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-[6.25rem] md:py-[7.5rem] relative overflow-hidden',
		lines: 'text-text-6xl md:text-text-7xl font-black leading-[1.15] tracking-tight text-midnight-900',
		line: 'block line-through decoration-goodparty-red decoration-4',
		punchline: 'mt-8 max-w-[31.25rem] font-medium text-midnight-900 text-body-xl leading-normal',
	},
});

export type StrikethroughBlockProps = {
	lines: string[];
	punchline: string;
	className?: string;
};

export function StrikethroughBlock(props: StrikethroughBlockProps) {
	const { base, lines, line, punchline } = styles();

	const heartSvg = "data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 90 C50 90,5 57,5 32 C5 11,27 1,50 22 C73 1,95 11,95 32 C95 57,50 90,50 90Z' fill='%23D8CCE5' opacity='0.3'/%3E%3C/svg%3E";

	return (
		<article className={cn(base(), 'bg-strikethrough-bg', props.className)} data-component='StrikethroughBlock'>
			<div
				className="absolute top-[-3.125rem] right-[-3.125rem] w-[25rem] h-[25rem] bg-no-repeat bg-center bg-contain pointer-events-none rotate-[15deg]"
				style={{ backgroundImage: `url("${heartSvg}")` }}
				aria-hidden
			/>
			<Container size="xl">
				<FadeIn>
					<div>
						<div className={lines()}>
						{props.lines.map((text, i) => (
							<span key={i} className={line()}>
								{text}
							</span>
						))}
					</div>
						<Text as="p" styleType="body-xl" className={punchline()}>
							{props.punchline}
						</Text>
					</div>
				</FadeIn>
			</Container>
		</article>
	);
}
