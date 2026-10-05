import { cn, tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-4',
		card: 'flex flex-col justify-between gap-8 rounded-xl p-4 lg:gap-16 lg:p-10',
		header: 'flex flex-col gap-2',
		eyebrow: 'flex items-center gap-3',
		iconCircle: 'flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-black',
		// Figma: Open Sans 600 at 20px everywhere. subtitle-2 keeps the family but is 18px on
		// phones, where subtitle-1's size matches; both sizes are in the tailwind-merge list.
		label: 'max-md:text-subtitle-1',
		button: 'max-lg:w-full lg:self-start',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

const cardStyles = tv({
	variants: {
		color: {
			red: 'bg-goodparty-red-light',
			waxflower: 'bg-waxflower-200',
			'bright-yellow': 'bg-bright-yellow-200',
			'halo-green': 'bg-halo-green-200',
			blue: 'bg-blue-200',
			lavender: 'bg-lavender-200',
			midnight: 'bg-midnight-900 text-white',
			cream: 'bg-goodparty-cream',
		},
	},
});

const ARROW_ICON_CLASS = 'min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4';

export type ElectionPositionResourceCardProps = {
	label?: string;
	title?: string;
	description?: string;
	icon?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	button?: ComponentButtonProps;
};

export type ElectionPositionResourcesBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	cards: ElectionPositionResourceCardProps[];
};

export function ElectionPositionResourcesBlock(props: ElectionPositionResourcesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, card, header, eyebrow, iconCircle, label, button } = styles({ backgroundColor });

	if (props.cards.length === 0) {
		return null;
	}

	return (
		<article className={cn(base(), props.className)} data-component='ElectionPositionResourcesBlock'>
			<Container size='xl'>
				<div className={grid()}>
					{props.cards.map((item, index) => {
						const color = item.color ?? 'waxflower';
						return (
							<div className={cn(card(), cardStyles({ color }))} key={index} data-component='ElectionPositionResourceCard'>
								<div className={header()}>
									{(item.icon || item.label) && (
										<div className={eyebrow()}>
											{item.icon && (
												<div className={iconCircle()}>
													<IconResolver icon={item.icon} />
												</div>
											)}
											{item.label && (
												<Text as='span' styleType='subtitle-2' className={label()}>
													{item.label}
												</Text>
											)}
										</div>
									)}
									{item.title && (
										<Text as='h3' styleType='heading-sm'>
											{item.title}
										</Text>
									)}
									{item.description && (
										<Text as='p' styleType='body-large'>
											{item.description}
										</Text>
									)}
								</div>
								{item.button && (
									<ComponentButton
										{...item.button}
										className={cn(button(), item.button.className)}
										buttonProps={{
											...(item.button.buttonProps ?? {}),
											styleType: color === 'midnight' ? 'outline-inverse' : 'secondary',
											styleSize: 'md',
										}}
										iconRight={<IconResolver icon='arrow-up-right' className={ARROW_ICON_CLASS} />}
									/>
								)}
							</div>
						);
					})}
				</div>
			</Container>
		</article>
	);
}
