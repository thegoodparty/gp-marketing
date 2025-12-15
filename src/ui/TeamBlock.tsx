import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { TeamCard, type TeamCardProps } from './TeamCard.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		container: 'flex flex-col gap-12 md:gap-20',
		layout: 'grid gap-8 md:gap-4',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		columns: {
			3: {
				layout: 'md:grid-cols-3',
			},
			4: {
				layout: 'md:grid-cols-4',
			},
		},
	},
});

export type TeamBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	className?: string;
	items: TeamCardProps[];
	columns?: 3 | 4;
	header?: HeaderBlockProps;
};

export function TeamBlock(props: TeamBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const columns = props.columns ?? 4;

	const { base, container, layout } = styles({ backgroundColor, columns });

	return (
		<article className={cn(base(), props.className)} data-component='TeamBlock'>
			<Container className={container()} size='xl'>
				{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='left' />}
				{props.items && props.items.length > 0 && (
					<div className={layout()}>
						{props.items?.map((item, index) => {
							return <TeamCard {...item} key={index} />;
						})}
					</div>
				)}
			</Container>
		</article>
	);
}
