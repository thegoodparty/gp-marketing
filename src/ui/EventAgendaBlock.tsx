import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { iconColorValues } from './_lib/designTypesStore.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

// IconResolver's md size pins a 24px minimum, which would make the 40px link row taller than its text.
const ARROW_ICON_CLASS = 'min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'grid gap-10 lg:grid-cols-2 lg:gap-20 lg:items-start',
		card: 'flex flex-col gap-6 rounded-2xl bg-white p-6 text-midnight-900 md:p-10',
		list: 'flex flex-col divide-y divide-black/12',
		item: 'flex gap-4 py-5 first:pt-0 last:pb-0 md:gap-5',
		marker: 'flex size-12 shrink-0 items-center justify-center rounded-full text-midnight-900',
		body: 'flex flex-col gap-1',
		description: 'text-neutral-600',
		link: 'mt-2 w-fit text-info-500 hover:text-info-600 hover:opacity-100 focus:ring-info-500/30 h-10! py-2.5',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream text-midnight-900' },
			midnight: { base: 'bg-midnight-900 text-white' },
		},
	},
});

const markerColors: Record<Exclude<(typeof iconColorValues)[number], 'mixed'>, string> = {
	red: 'bg-goodparty-red-light',
	waxflower: 'bg-waxflower-200',
	'bright-yellow': 'bg-bright-yellow-200',
	'halo-green': 'bg-halo-green-200',
	blue: 'bg-blue-200',
	lavender: 'bg-lavender-200',
	white: 'bg-goodparty-cream',
};

const mixedCycle = iconColorValues.filter(color => color !== 'mixed' && color !== 'white');

export type EventAgendaItemProps = {
	_key?: string;
	icon?: string;
	title?: string;
	copy?: ReactNode;
	button?: ComponentButtonProps;
};

export type EventAgendaBlockProps = {
	backgroundColor?: 'cream' | 'midnight';
	className?: string;
	header?: HeaderBlockProps;
	agendaTitle?: string;
	color?: (typeof iconColorValues)[number];
	items?: EventAgendaItemProps[];
};

export function EventAgendaBlock(props: EventAgendaBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'mixed';
	const s = styles({ backgroundColor });

	const items = (props.items ?? []).filter(item => Boolean(item.title) || item.copy != null || Boolean(item.button));
	const hasCard = items.length > 0;
	const header = props.header;
	const hasHeader = Boolean(
		header && (header.title || header.label || header.caption || header.copy != null || (header.buttons && header.buttons.length > 0)),
	);
	if (!hasHeader && !hasCard) {
		return null;
	}

	return (
		<article className={cn(s.base(), props.className)} data-component='EventAgendaBlock'>
			<Container size='xl'>
				<div className={cn(s.wrapper(), (!hasCard || !hasHeader) && 'lg:grid-cols-1')}>
					{hasHeader && <HeaderBlock {...header} backgroundColor={backgroundColor} layout='left' />}
					{hasCard && (
						<div className={s.card()}>
							{props.agendaTitle && (
								<Text as='h3' styleType='overline' className='text-neutral-500'>
									{props.agendaTitle}
								</Text>
							)}
							{items.length > 0 && (
								<ol className={s.list()}>
									{items.map((item, index) => {
										const markerColor = color === 'mixed' ? (mixedCycle[index % mixedCycle.length] ?? 'blue') : color;
										return (
											<li key={item._key ?? index} className={s.item()} data-component='EventAgendaItem'>
												<div className={cn(s.marker(), markerColors[markerColor])} aria-hidden>
													{item.icon ? (
														<IconResolver icon={item.icon} />
													) : (
														<Text as='span' styleType='subtitle-2'>
															{index + 1}
														</Text>
													)}
												</div>
												<div className={s.body()}>
													{item.title && (
														<Text as='h4' styleType='subtitle-1'>
															{item.title}
														</Text>
													)}
													{isValidRichText(item.copy) && (
														<Text as='div' styleType='body-2' className={s.description()}>
															{item.copy}
														</Text>
													)}
													{item.button && (
														<ComponentButton
															{...item.button}
															className={cn(s.link(), item.button.className)}
															buttonProps={{ ...(item.button.buttonProps ?? {}), styleType: 'min-ghost', styleSize: 'md' }}
															iconRight={<IconResolver icon='arrow-up-right' className={ARROW_ICON_CLASS} />}
														/>
													)}
												</div>
											</li>
										);
									})}
								</ol>
							)}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
