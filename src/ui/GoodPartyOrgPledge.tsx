import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { componentColorValues, iconColorValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { CircleIcon } from './CircleIcon.tsx';
import type { IconType } from './IconResolver.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		cards: 'flex flex-col gap-12',
		grid: 'grid gap-8 md:grid-cols-2',
		card: 'flex flex-col items-start gap-8 min-w-80 p-6 flex-1',
		footer: 'flex flex-wrap justify-center gap-4',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
			cream: {
				base: 'bg-goodparty-cream text-midnight-900',
			},
		},
		columnLayout: {
			'1Col': {
				grid: 'md:grid-cols-1 max-w-[44rem] mx-auto w-full',
				card: 'min-w-0',
			},
			'2Col': {},
		},
	},
});

export type PledgeCard = {
	icon?: IconType;
	title?: string;
	content?: ReactNode;
	button?: ComponentButtonProps;
	iconBg?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
};

export type GoodPartyOrgPledgeProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	header?: HeaderBlockProps;
	pledgeCards?: PledgeCard[];
	iconBg?: Exclude<(typeof componentColorValues)[number], 'inverse'> | 'mixed';
	columnLayout?: '1Col' | '2Col';
	/** Section-level buttons, rendered once below the cards rather than in the header. */
	footerButtons?: ComponentButtonProps[];
};

const PLEDGE_MIXED_ICON_COLORS: Exclude<(typeof iconColorValues)[number], 'mixed' | 'white'>[] = [
	'blue',
	'bright-yellow',
	'lavender',
	'halo-green',
];

export function GoodPartyOrgPledge(props: GoodPartyOrgPledgeProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const iconBg = props.iconBg ?? 'blue';
	const columnLayout = props.columnLayout ?? '2Col';
	const { base, wrapper, cards, grid, card, footer } = styles({ backgroundColor, columnLayout });

	const resolvedStyle = resolveButtonStyleType('min-ghost', backgroundColor);

	const resolveCardIconBg = (card: PledgeCard, index: number): Exclude<(typeof componentColorValues)[number], 'inverse'> => {
		if (card.iconBg) return card.iconBg;
		if (iconBg === 'mixed') {
			return PLEDGE_MIXED_ICON_COLORS[index % PLEDGE_MIXED_ICON_COLORS.length]!;
		}
		return iconBg;
	};

	return (
		<article className={cn(base(), props.className)} data-component='GoodPartyOrgPledge'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='center' />}
					<div className={cards()}>
						<div className={grid()}>
							{props.pledgeCards?.map((pledgeCard, index) => (
								<div key={`pledge-${index}`} className={card()}>
									<div className='flex flex-col gap-4'>
										{pledgeCard.icon && <CircleIcon icon={pledgeCard.icon} iconBg={resolveCardIconBg(pledgeCard, index)} />}
										{pledgeCard.title && (
											<Text as='h3' styleType='subtitle-1'>
												{pledgeCard.title}
											</Text>
										)}
										{isValidRichText(pledgeCard.content) && <Text styleType='body-2'>{pledgeCard.content}</Text>}
									</div>
									{pledgeCard.button && (
										<ComponentButton
											className='w-fit'
											{...pledgeCard.button}
											buttonProps={{ ...(pledgeCard.button.buttonProps ?? {}), styleType: resolvedStyle }}
										/>
									)}
								</div>
							))}
						</div>
						{props.footerButtons && props.footerButtons.length > 0 && (
							<div className={footer()}>
								{props.footerButtons.map((item, index) => (
									<ComponentButton
										key={`pledge-footer-${index}`}
										className='max-sm:w-full'
										{...item}
										buttonProps={{
											...(item.buttonProps ?? {}),
											styleType: resolveButtonStyleType(item?.buttonProps?.styleType ?? 'primary', backgroundColor),
										}}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
