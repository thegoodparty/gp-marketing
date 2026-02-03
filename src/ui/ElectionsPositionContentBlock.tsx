import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { isValidRichText } from './_lib/isValidRichText.ts';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'grid lg:grid-cols-[auto_1fr] gap-8',
		card: 'bg-white rounded-lg p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4 order-2 lg:order-1 w-fit self-start',
		cardContent: 'flex flex-col gap-3',
		buttonContainer: 'w-fit',
		rightContent: 'flex flex-col gap-8 order-1 lg:order-2',
		topHeadline: '',
		gridSection: 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:grid-cols-3',
		gridItem: 'flex flex-col gap-3',
		separator: 'border-t border-neutral-200',
		bottomSection: 'flex flex-col gap-6',
		bottomItem: 'flex flex-col gap-3',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
				rightContent: 'text-white',
				card: 'bg-white',
				separator: 'border-neutral-700',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type ElectionsPositionContentBlockCardProps = {
	headline?: string;
	subhead?: string;
	bodyCopy?: ReactNode | ReactNode[];
	primaryCTA?: ComponentButtonProps;
};

export type ElectionsPositionContentBlockGridItem = {
	subhead?: string;
	bodyCopy?: ReactNode;
};

export type ElectionsPositionContentBlockBottomItem = {
	headline?: string;
	bodyCopy?: ReactNode;
};

export type ElectionsPositionContentBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	card?: ElectionsPositionContentBlockCardProps;
	topHeadline?: string;
	gridItems?: ElectionsPositionContentBlockGridItem[];
	bottomItems?: ElectionsPositionContentBlockBottomItem[];
};

export function ElectionsPositionContentBlock(props: ElectionsPositionContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, card, cardContent, buttonContainer, rightContent, topHeadline, gridSection, gridItem, separator, bottomSection, bottomItem } =
		styles({ backgroundColor });

	const resolvedButtonStyle = props.card?.primaryCTA
		? props.card.primaryCTA.buttonProps?.styleType ?? 'secondary'
		: undefined;

	return (
		<article className={cn(base(), props.className)} data-component='ElectionsPositionContentBlock'>
			<Container size='xl'>
				<div className={grid()}>
					{props.card && (
						<div className={card()}>
							<div className={cardContent()}>
								{props.card.headline && (
									<Text as='h2' styleType='heading-lg'>
										{props.card.headline}
									</Text>
								)}
								{props.card.subhead && (
									<Text as='h3' styleType='heading-md'>
										{props.card.subhead}
									</Text>
								)}
								{Array.isArray(props.card.bodyCopy) ? (
									props.card.bodyCopy.map((copy, index) =>
										isValidRichText(copy) ? (
											<Text key={index} styleType='body-1'>
												{copy}
											</Text>
										) : null,
									)
								) : isValidRichText(props.card.bodyCopy) ? (
									<Text styleType='body-1'>{props.card.bodyCopy}</Text>
								) : null}
							</div>
							{props.card.primaryCTA && (
								<div className={buttonContainer()}>
									<ComponentButton
										{...props.card.primaryCTA}
										buttonProps={{ ...(props.card.primaryCTA.buttonProps ?? {}), styleType: resolvedButtonStyle }}
									/>
								</div>
							)}
						</div>
					)}
					<div className={cn(rightContent())}>
						{props.topHeadline && (
							<Text as='h2' styleType='heading-lg' className={topHeadline()}>
								{props.topHeadline}
							</Text>
						)}
						{props.gridItems && props.gridItems.length > 0 && (
							<div className={gridSection()}>
								{props.gridItems.map((item, index) => (
									<div key={index} className={gridItem()}>
										{item.subhead && (
											<Text as='h3' styleType='heading-md'>
												{item.subhead}
											</Text>
										)}
										{isValidRichText(item.bodyCopy) && (
											<Text styleType='body-1'>{item.bodyCopy}</Text>
										)}
									</div>
								))}
							</div>
						)}
						{(props.gridItems?.length ?? 0) > 0 && (props.bottomItems?.length ?? 0) > 0 && (
							<div className={separator()} />
						)}
						{props.bottomItems && props.bottomItems.length > 0 && (
							<div className={bottomSection()}>
								{props.bottomItems.map((item, index) => (
									<div key={index} className={bottomItem()}>
										{item.headline && (
											<Text as='h2' styleType='heading-md'>
												{item.headline}
											</Text>
										)}
										{isValidRichText(item.bodyCopy) && (
											<Text styleType='body-1'>{item.bodyCopy}</Text>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
