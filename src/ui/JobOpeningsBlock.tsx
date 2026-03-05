import { cn, tv } from './_lib/utils';
import { Container } from './Container';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock';
import { JobOpeningsCard, type JobOpeningsCardProps } from './JobOpeningsCard';
import { Text } from './Text';

const styles = tv({
	slots: {
		base: 'bg-goodparty-cream py-(--container-padding)',
		wrapper: 'flex flex-col gap-10 md:gap-20',
		cardsGrid: 'grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-4',
	},
});

export type JobOpeningsBlockProps = {
	className?: string;
	header?: HeaderBlockProps;
	cards?: JobOpeningsCardProps[];
};

export function JobOpeningsBlock(props: JobOpeningsBlockProps) {
	const { base, wrapper, cardsGrid } = styles();

	return (
		<div className={cn(base(), props.className)} data-component='JobOpeningsBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor='cream' />}
					{props.cards && props.cards.length > 0 ? (
						<div className={cardsGrid()}>
							{props.cards.map((card, index) => (
								<JobOpeningsCard
									key={`job-card-${index}-${card.title ?? ''}`}
									className='w-full min-w-0'
									{...card}
								/>
							))}
						</div>
					) : (
						<Text styleType='body-md'>No open positions at this time. Check back soon.</Text>
					)}
				</div>
			</Container>
		</div>
	);
}
