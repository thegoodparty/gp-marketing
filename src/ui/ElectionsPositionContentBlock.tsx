import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { type backgroundTypeValues, defaultCtaButtonStyleType } from './_lib/designTypesStore.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { isValidRichText } from './_lib/isValidRichText.ts';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'grid lg:grid-cols-[auto_1fr] gap-20',
		card: 'bg-white rounded-lg border border-neutral-200 p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4 order-2 lg:order-1 w-fit self-start lg:min-w-[400px]',
		cardContent: 'flex flex-col gap-8',
		buttonContainer: 'w-fit',
		rightContent: 'flex flex-col gap-8 order-1 lg:order-2',
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
				card: 'bg-white text-midnight-900',
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
	rightColumnCTA?: ComponentButtonProps;
};

export function ElectionsPositionContentBlock(props: ElectionsPositionContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, card, cardContent, buttonContainer, rightContent, gridSection, gridItem, separator, bottomSection, bottomItem } =
		styles({ backgroundColor });

	const resolvedButtonStyle = props.card?.primaryCTA
		? resolveButtonStyleType(
				props.card.primaryCTA.buttonProps?.styleType ?? defaultCtaButtonStyleType,
				backgroundColor,
			)
		: undefined;

	const resolvedRightColumnCTAStyle = props.rightColumnCTA
		? resolveButtonStyleType(
				props.rightColumnCTA.buttonProps?.styleType ?? defaultCtaButtonStyleType,
				backgroundColor,
			)
		: undefined;

	return (
		<article className={cn(base(), props.className)} data-component='ElectionsPositionContentBlock'>
			<Container size='xl'>
				<div className={grid()}>
					{props.card && (
						<div className={card()}>
							<div className={cardContent()}>
								{props.card.headline && (
									<Text as='h2' styleType='heading-md'>
										{props.card.headline}
									</Text>
								)}
								<div className='flex flex-col gap-2'>
									{props.card.subhead && (
										<Text as='h3' styleType='overline'>
											{props.card.subhead}
										</Text>
									)}
									{Array.isArray(props.card.bodyCopy) ? (
										<div className='flex flex-col gap-8'>
											{props.card.bodyCopy
												.filter((copy): copy is NonNullable<typeof copy> => Boolean(isValidRichText(copy)))
												.map((copy, index) => (
													<Text key={index} styleType='body-1'>
														{copy}
													</Text>
												))}
										</div>
									) : isValidRichText(props.card.bodyCopy) ? (
										<Text styleType='body-1'>{props.card.bodyCopy}</Text>
									) : null}
								</div>
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
							<Text as='h2' styleType='subtitle-1'>
								{props.topHeadline}
							</Text>
						)}
						{props.gridItems && props.gridItems.length > 0 && (
							<div className={gridSection()}>
								{props.gridItems.map((item, index) => (
									<div key={index} className={gridItem()}>
										{item.subhead && (
											<Text as='h3' styleType='overline'>
												{item.subhead}
											</Text>
										)}
										{isValidRichText(item.bodyCopy) && (
											<Text styleType='body-2'>{item.bodyCopy}</Text>
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
											<Text as='h2' styleType='subtitle-1'>
												{item.headline}
											</Text>
										)}
										{isValidRichText(item.bodyCopy) && (
											<Text styleType='body-2'>{item.bodyCopy}</Text>
										)}
									</div>
								))}
							</div>
						)}
						{props.rightColumnCTA && (
							<div className={buttonContainer()}>
								<ComponentButton
									{...props.rightColumnCTA}
									buttonProps={{
										...(props.rightColumnCTA.buttonProps ?? {}),
										styleType: resolvedRightColumnCTAStyle,
									}}
								/>
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
