import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { cn, tv } from '~/ui/_lib/utils';
import { Container } from '~/ui/Container';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-16',
		grid: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
		card: 'bg-white text-midnight-900 rounded-lg p-6 md:p-8 flex flex-col gap-4',
		cardHeader: 'flex items-center gap-4',
		icon: 'rounded-full flex items-center justify-center size-[3rem] shrink-0',
		row: 'grid grid-cols-1 gap-2 border-t border-midnight-900/10 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4',
		chips: 'flex flex-wrap gap-2',
		chip: 'inline-flex items-center rounded-full border border-midnight-900/15 bg-goodparty-cream px-3 py-1 text-sm leading-tight',
	},
	variants: {
		backgroundColor: {
			midnight: { base: 'bg-midnight-900 text-white' },
			cream: { base: 'bg-goodparty-cream text-midnight-900' },
		},
	},
});

const iconColors = ['bg-lavender-200', 'bg-blue-200', 'bg-halo-green-200', 'bg-waxflower-200', 'bg-bright-yellow-200', 'bg-goodparty-red-light'];

export type VoterFilter = {
	label: string;
	values: string[];
};

export type VoterFilterGroup = {
	title?: string;
	icon?: string;
	filters: VoterFilter[];
};

export type VoterFilterBlockProps = {
	backgroundColor?: 'cream' | 'midnight';
	header?: HeaderBlockProps;
	groups?: VoterFilterGroup[];
};

export function VoterFilterBlock(props: VoterFilterBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid, card, cardHeader, icon, row, chips, chip } = styles({ backgroundColor });
	const groups = (props.groups ?? []).filter(group => group.filters.length > 0);

	return (
		<div className={base()} data-component='VoterFilterBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					{groups.length > 0 && (
						<div className={grid()}>
							{groups.map((group, groupIndex) => (
								<article key={`${group.title ?? 'group'}-${groupIndex}`} className={card()}>
									{(group.title || group.icon) && (
										<div className={cardHeader()}>
											{group.icon && (
												<div className={cn(icon(), iconColors[groupIndex % iconColors.length])}>
													<IconResolver icon={group.icon} className='text-midnight-900' />
												</div>
											)}
											{group.title && (
												<Text as='h3' styleType='heading-sm'>
													{group.title}
												</Text>
											)}
										</div>
									)}
									<dl className='flex flex-col'>
										{group.filters.map((filter, filterIndex) => (
											<div key={`${filter.label}-${filterIndex}`} className={row()}>
												<Text as='dt' styleType='body-2' className='font-semibold'>
													{filter.label}
												</Text>
												<dd className={chips()}>
													{filter.values.map((value, valueIndex) => (
														<span key={`${value}-${valueIndex}`} className={chip()}>
															{value}
														</span>
													))}
												</dd>
											</div>
										))}
									</dl>
								</article>
							))}
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}
