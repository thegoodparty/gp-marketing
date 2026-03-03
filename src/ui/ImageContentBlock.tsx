import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { backgroundTypeValues } from './_lib/designTypesStore';
import { cn, tv } from '~/ui/_lib/utils';
import { Container } from '~/ui/Container';
import { ImageContentCard, type ImageContentCardProps } from '~/ui/ImageContentCard';

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

export type ImageContentBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	columns?: '2' | '3' | '4';
	items?: ImageContentCardProps[];
};

export function ImageContentBlock(props: ImageContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper } = styles({ backgroundColor });

	return (
		<div className={base()}>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
					<div
						className={cn(
							'grid grid-cols-1 gap-[2rem] px-0',
							props.columns === '2'
								? 'sm:grid-cols-2 sm:px-[clamp(0rem,-7.6rem+19vw,9.5rem)]'
								: props.columns === '3'
									? 'sm:grid-cols-2 md:grid-cols-3'
									: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
						)}
					>
						{props.items?.map((item, index) => (
							<ImageContentCard key={`image-content-card-${index}-${item.title}-${item.copy?.toString().slice(0, 10) ?? ''}`} {...item} />
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
