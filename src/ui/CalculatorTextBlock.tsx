'use client';

import type { ReactNode } from 'react';
import { useId, useState } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import type { ResolvedTextSize } from './_lib/resolveTextSize.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '../sanity/utils/Logo.tsx';

const RECORDS_MIN = 0;
const RECORDS_MAX = 500_000;
const COST_PER_RECORD = 0.1;
const GOODPARTY_MONTHLY = 10;

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'grid gap-8 md:grid-cols-2 md:gap-12',
		calculator:
			'flex flex-col gap-6 p-(--container-padding) bg-white rounded-xl shadow-sm',
		calculatorHeader: 'flex items-center justify-between',
		tryItLink:
			'flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors',
		sliderSection: 'flex flex-col gap-2',
		sliderLabels: 'flex justify-between text-sm text-neutral-500',
		sliderWrapper: 'relative w-full pt-8',
		slider: [
			'w-full h-2 appearance-none cursor-pointer rounded-full',
			'bg-midnight-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
			'[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#9747FF] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white',
			'[&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
			'[&::-moz-range-thumb]:bg-[#9747FF] [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white',
		],
		recordsLabel:
			'absolute -top-1 transform -translate-x-1/2 px-3 py-1.5 bg-white border border-neutral-200 rounded shadow-sm text-sm font-medium text-neutral-900 whitespace-nowrap',
		comparisonRow: 'flex items-stretch gap-2',
		hexagon:
			'flex-1 flex flex-col items-center justify-center p-6 border border-white min-h-[10rem]',
		hexagonGoodparty: 'bg-lavender-100',
		hexagonOthers: 'bg-[#9747FF] text-white',
		hexagonIcon: 'mb-2',
		hexagonLabel: 'text-sm font-medium mb-1',
		hexagonValue:
			'text-center text-[#FFF] font-primary text-[32px] font-medium leading-[110%] [font-feature-settings:\'liga\'_0,\'clig\'_0]',
		hexagonSub: 'text-sm opacity-90 mt-0.5',
		hexagonDetail: 'text-xs mt-2 opacity-80',
		vsBadge:
			'flex-shrink-0 w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-700 z-10 self-center drop-shadow-[0_4px_9px_rgba(56,21,153,0.30)]',
		content: 'flex flex-col gap-6 p-(--container-padding) md:self-center',
	},
	variants: {
		backgroundColor: {
			cream: 'bg-goodparty-cream',
			midnight: 'bg-midnight-900',
		},
		layout: {
			'calculator-left': {},
			'calculator-right': {
				wrapper: 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1',
			},
		},
	},
});

export type CalculatorTextBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	className?: string;
	layout?: 'calculator-left' | 'calculator-right';
	calculator?: {
		heading?: string;
		goodPartyLabel?: string;
		goodPartyCost?: number;
		goodPartyPeriod?: string;
		goodPartyDetail?: string;
		othersLabel?: string;
		othersCostPerRecord?: number;
		othersCostLabel?: string;
		othersPerRecordDetail?: string;
		tryItText?: string;
		recordsMin?: number;
		recordsMax?: number;
	};
	text?: {
		title?: string;
		copy?: ReactNode;
		buttons?: ComponentButtonProps[];
	};
	textSize?: ResolvedTextSize;
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-US').format(value);
}

export function CalculatorTextBlock(props: CalculatorTextBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const layout = props.layout ?? 'calculator-left';
	const textSize = props.textSize ?? { heading: 'heading-md', body: 'body-2' };

	const recordsMin = props.calculator?.recordsMin ?? RECORDS_MIN;
	const recordsMax = props.calculator?.recordsMax ?? RECORDS_MAX;
	const costPerRecord = props.calculator?.othersCostPerRecord ?? COST_PER_RECORD;
	const goodPartyCost = props.calculator?.goodPartyCost ?? GOODPARTY_MONTHLY;

	const [records, setRecords] = useState(
		Math.round((recordsMin + recordsMax) / 2),
	);

	const othersCost = Math.round(records * costPerRecord);
	const thumbPercent = Math.max(2, Math.min(98, (records / recordsMax) * 100));
	const clipId = `calculator-house-${useId().replaceAll(':', '')}`;

	const handleTryIt = () => {
		setRecords(Math.round((recordsMin + recordsMax) / 2));
	};

	const {
		base,
		wrapper,
		calculator,
		calculatorHeader,
		tryItLink,
		sliderSection,
		sliderLabels,
		sliderWrapper,
		slider,
		recordsLabel,
		comparisonRow,
		hexagon,
		hexagonGoodparty,
		hexagonOthers,
		hexagonIcon,
		hexagonLabel,
		hexagonValue,
		hexagonSub,
		hexagonDetail,
		vsBadge,
		content,
	} = styles({ backgroundColor, layout });

	return (
		<article className={cn(base(), props.className)} data-component='CalculatorTextBlock'>
			<svg width={0} height={0} aria-hidden="true" style={{ position: 'absolute' }}>
				<defs>
					<clipPath id={clipId} clipPathUnits='objectBoundingBox'>
						<path
							d="M0 0.2798C0 0.2533 0.0164 0.2285 0.0429 0.2154L0.4583 0.0096C0.4842 0 0.5158 0 0.5418 0.0096L0.9571 0.2154C0.9836 0.2302 1 0.2533 1 0.2798V0.9218C1 0.9632 0.9621 0.9964 0.9153 0.9964H0.0847C0.0379 0.9964 0 0.9632 0 0.9218V0.2798Z"
						/>
					</clipPath>
				</defs>
			</svg>
			<Container size='xl'>
				<div className={wrapper()}>
					<div className={calculator()}>
						<div className={calculatorHeader()}>
							{props.calculator?.heading && (
								<Text as='h3' styleType='subtitle-1'>
									{props.calculator.heading}
								</Text>
							)}
							<button
								type='button'
								className={tryItLink()}
								onClick={handleTryIt}
								aria-label='Reset calculator'
							>
								<Text as='span' styleType='caption'>
									{props.calculator?.tryItText ?? 'Try it yourself'}
								</Text>
								<IconResolver icon='refresh-cw' className='min-w-4 min-h-4 w-4 h-4' />
							</button>
						</div>

						<div className={sliderSection()}>
							<div className={sliderWrapper()}>
								<div
									className={recordsLabel()}
									style={{ left: `${thumbPercent}%` }}
								>
									{formatNumber(records)} records
								</div>
								<input
									type='range'
									min={recordsMin}
									max={recordsMax}
									step={Math.max(1, Math.floor(recordsMax / 500))}
									value={records}
									onChange={e => setRecords(Number(e.target.value))}
									className={slider()}
									aria-label='Number of voter records'
								/>
							</div>
							<div className={sliderLabels()}>
								<span>{formatNumber(recordsMin)}</span>
								<span>{formatNumber(recordsMax)}</span>
							</div>
						</div>

						<div className={comparisonRow()}>
							<div
								className={cn(hexagon(), hexagonGoodparty())}
								style={{ clipPath: `url(#${clipId})` }}
							>
								<div className={hexagonIcon()}>
									<Logo width={24} height={24} className='min-w-6 min-h-6' />
								</div>

								<Text as='span' styleType='heading-md' className={hexagonValue()}>
									{formatCurrency(goodPartyCost)}
								</Text>
								<Text as='span' styleType='caption' className={hexagonSub()}>
									{props.calculator?.goodPartyPeriod ?? 'per month'}
								</Text>
								<Text as='span' styleType='caption' className={hexagonDetail()}>
									{props.calculator?.goodPartyDetail ?? 'Unlimited records'}
								</Text>
							</div>

							<div className={vsBadge()}>vs</div>

							<div
								className={cn(hexagon(), hexagonOthers())}
								style={{ clipPath: `url(#${clipId})` }}
							>
								<Text as='span' styleType='caption' className={hexagonLabel()}>
									{props.calculator?.othersLabel ?? 'Others'}
								</Text>
								<Text as='span' styleType='heading-md' className={hexagonValue()}>
									{formatCurrency(othersCost)}
								</Text>
								<Text as='span' styleType='caption' className={hexagonSub()}>
									{props.calculator?.othersCostLabel ?? 'Total cost'}
								</Text>
								<Text as='span' styleType='caption' className={hexagonDetail()}>
									{props.calculator?.othersPerRecordDetail ?? '£0.1 per record'}
								</Text>
							</div>
						</div>
					</div>

					<div className={content()}>
						<div className={cn('flex flex-col gap-3 md:gap-4', backgroundColor === 'midnight' && 'text-white')}>
							{props.text?.title && (
								<Text as='h2' styleType={textSize.heading}>
									{props.text.title}
								</Text>
							)}
							{isValidRichText(props.text?.copy) && (
								<Text styleType={textSize.body} className={backgroundColor === 'midnight' ? 'text-neutral-300' : undefined}>
									{props.text?.copy}
								</Text>
							)}
						</div>
						{(props.text?.buttons?.length ?? 0) > 0 && (
							<div className='flex flex-wrap gap-4 max-sm:w-full'>
								{(props.text?.buttons ?? []).map((item, index) => {
									const resolvedStyle = resolveButtonStyleType(item?.buttonProps?.styleType ?? 'primary', backgroundColor);
									return (
										<ComponentButton
											key={index}
											className='max-sm:w-full w-fit'
											{...item}
											buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
										/>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
