import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-[6.25rem] md:py-[7.5rem] relative overflow-hidden',
		lines: 'text-text-6xl md:text-text-7xl font-black leading-[1.15] tracking-tight text-midnight-900',
		line: 'block line-through decoration-[#E0162B] decoration-4',
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

	return (
		<article className={cn(base(), 'bg-[#EDE5F4]', props.className)} data-component='StrikethroughBlock'>
			<Container size="xl">
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
			</Container>
		</article>
	);
}
