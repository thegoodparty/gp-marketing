import type { backgroundTypeValues } from './_lib/designTypesStore';
import { tv } from './_lib/utils';

import { Container } from './Container';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock';
import { Stat, type StatProps } from './Stat';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'grid gap-6',
		stats: 'grid gap-4',
	},
	variants: {
		backgroundColor: {
			midnight: 'bg-midnight-900',
			cream: 'bg-goodparty-cream',
		},
		layout: {
			stacked: {
				wrapper: 'md:gap-16',
				stats: 'md:grid-cols-4',
			},
			'side-by-side': {
				wrapper: 'gap-8 md:grid-cols-2',
				stats: 'md:grid-cols-2',
			},
		},
	},
});

export interface StatsBlockProps {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	stats?: StatProps[];
	layout?: 'stacked' | 'side-by-side';
}

export const StatsBlock = (props: StatsBlockProps) => {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const layout = props.layout ?? 'stacked';

	const { base, stats, wrapper } = styles({ backgroundColor, layout });

	return (
		<article className={base()} data-component='StatsBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<HeaderBlock {...props.header} backgroundColor={backgroundColor} />
					<div className={stats()}>
						{props.stats?.map(stat => (
							<Stat key={stat._key} {...stat} />
						))}
					</div>
				</div>
			</Container>
		</article>
	);
};
