import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues, componentColorValues } from './_lib/designTypesStore.ts';

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
		grid: 'grid gap-6 md:grid-cols-2',
		card: 'flex flex-col gap-4',
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
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	pledgeCards?: PledgeCard[];
	iconBg?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
};

export function GoodPartyOrgPledge(props: GoodPartyOrgPledgeProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const iconBg = props.iconBg ?? 'blue';
	const { base, wrapper, grid, card } = styles({ backgroundColor });

	const resolvedStyle = resolveButtonStyleType('min-ghost', backgroundColor);

	return (
		<article className={cn(base(), props.className)} data-component='GoodPartyOrgPledge'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='center' />}
					<div className={grid()}>
						{props.pledgeCards?.map((pledgeCard, index) => (
							<div key={`pledge-${index}`} className={card()}>
								<div className='flex flex-col gap-4'>
									{pledgeCard.icon && <CircleIcon icon={pledgeCard.icon} iconBg={pledgeCard.iconBg ?? iconBg} />}
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
				</div>
			</Container>
		</article>
	);
}
