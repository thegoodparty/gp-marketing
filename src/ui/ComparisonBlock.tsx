import { ComparisonTableCard, type ComparisonTableCardProps } from '~/ui/ComparisonTableCard';
import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { backgroundTypeValues } from './_lib/designTypesStore';
import { tv } from '~/ui/_lib/utils';
import { Container } from '~/ui/Container';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
	},
	variants: {
		backgroundColor: {
			midnight: 'bg-midnight-900',
			cream: 'bg-goodparty-cream',
		},
	},
});

export type ComparisonBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	tableOne?: ComparisonTableCardProps;
	tableTwo?: ComparisonTableCardProps;
};

export function ComparisonBlock(props: ComparisonBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper } = styles({ backgroundColor });
	return (
		<div className={base()}>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					<div className='grid gap-[1.5rem] md:gap-[2.5rem] md:grid-cols-2'>
						{props.tableOne && <ComparisonTableCard {...props.tableOne} />}
						{props.tableTwo && <ComparisonTableCard {...props.tableTwo} />}
					</div>
				</div>
			</Container>
		</div>
	);
}
