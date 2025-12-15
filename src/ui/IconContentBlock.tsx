import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { backgroundTypeValues, iconColorValues } from './_lib/designTypesStore';
import { cn, tv } from '~/ui/_lib/utils';
import { Container } from '~/ui/Container';
import { IconContent, type IconContentProps } from '~/ui/IconContent';
import { shuffleArray } from '~/ui/_lib/shuffleArray';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
	},
	variants: {
		backgroundColor: {
			midnight: 'bg-midnight-900 text-white',
			cream: 'bg-goodparty-cream text-midnight-900',
		},
	},
});

export type IconContentBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	columns?: '2' | '3' | '4';
	color: IconContentProps['color'] | 'mixed';
	items?: IconContentProps[];
};

export function IconContentBlock(props: IconContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper } = styles({ backgroundColor });
	const colors = shuffleArray(iconColorValues.filter(color => color !== 'mixed' && color !== 'white'));

	while (colors.length < (props.items?.length ?? 0)) {
		colors.push(...colors);
	}

	const containerClasses = cn(
		'flex flex-wrap justify-center gap-x-0 md:gap-y-8', // no horizontal gap; only vertical gap at md+
	);

	// item
	const itemClasses = cn(
		'grow-0 shrink-0 basis-full', // 1 column by default
		props.columns === '2'
			? 'sm:basis-1/2' // 2 columns at sm+
			: props.columns === '3'
				? 'sm:basis-1/2 md:basis-1/3' // 2 @ sm, 3 @ md
				: 'sm:basis-1/2 md:basis-1/3 lg:basis-1/4', // 2 @ sm, 3 @ md, 4 @ lg
	);

	return (
		<div className={base()}>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					<div className={containerClasses}>
						{props.items?.map((item, index) => (
							<IconContent
								key={`icon-content-${index}-${item.title}-${item.copy?.toString().slice(0, 10) ?? ''}-${item.icon}`}
								{...item}
								color={props.color !== 'mixed' ? props.color : colors[index]}
								className={itemClasses}
							/>
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
