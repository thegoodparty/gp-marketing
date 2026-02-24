import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { SectionQuoteCard, type SectionQuoteCardProps } from './SectionQuoteCard.tsx';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		grid: 'grid gap-6 md:grid-cols-2',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type SectionQuoteBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	items: SectionQuoteCardProps[];
};

export function SectionQuoteBlock(props: SectionQuoteBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='SectionQuoteBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout={props.header.layout ?? 'left'} />}
					{props.items && props.items.length > 0 && (
						<div className={grid()}>
							{props.items.map((item, index) => (
								<SectionQuoteCard key={item._key ?? index} {...item} />
							))}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
