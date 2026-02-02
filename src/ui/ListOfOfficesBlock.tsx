'use client';

import { useState, useMemo } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-6',
		headingWrapper: 'flex items-center gap-2 justify-center',
		headingIcon: 'w-4 h-4 text-lavender-600',
		card: 'bg-goodparty-cream rounded-lg p-6 md:p-8',
		headerRow: 'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6',
		headline: 'font-primary text-heading-md md:text-heading-lg',
		yearSelectorWrapper: 'relative flex items-center gap-2',
		yearLabel: 'font-secondary text-subtitle-2 text-neutral-600',
		yearSelect: [
			'appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-10',
			'text-black focus:border-lavender-600 focus:outline-none focus:ring-2 focus:ring-lavender-600/30',
			'cursor-pointer font-secondary text-body-2 min-w-[120px]',
		],
		yearSelectIcon: 'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500',
		tableWrapper: 'overflow-x-auto',
		table: 'w-full border-collapse',
		tableHeader: 'border-b border-neutral-200',
		tableHeaderCell: 'py-3 px-4 text-left font-secondary text-subtitle-2 text-neutral-600',
		tableBody: '',
		tableRow: 'border-b border-neutral-100 hover:bg-neutral-50 transition-colors',
		tableCell: 'py-4 px-4',
		typeTag: 'inline-block px-3 py-1 rounded bg-goodparty-blue text-white font-secondary text-sm font-semibold',
		positionText: 'font-secondary text-body-2 text-neutral-900',
		dateText: 'font-secondary text-body-2 text-neutral-700',
		arrowIcon: 'text-neutral-400',
		cardList: 'flex flex-col gap-3 md:hidden',
		officeCard: 'bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-lavender-600 transition-colors',
		cardContent: 'flex items-start justify-between gap-4',
		cardLeft: 'flex-1 flex flex-col gap-2',
		cardRight: 'flex-shrink-0',
		desktopTable: 'hidden md:block',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
				card: 'bg-neutral-900 border-lavender-500',
				headline: 'text-white',
				yearLabel: 'text-neutral-300',
				yearSelect: 'bg-neutral-800 border-neutral-600 text-white focus:border-lavender-400',
				yearSelectIcon: 'text-neutral-400',
				tableHeaderCell: 'text-neutral-300',
				positionText: 'text-white',
				dateText: 'text-neutral-300',
				officeCard: 'bg-neutral-800 border-neutral-700',
			},
			cream: {
				base: '',
				card: 'bg-goodparty-cream',
				headline: 'text-neutral-900',
				yearLabel: 'text-neutral-600',
				yearSelect: 'bg-white border-neutral-300 text-black',
				yearSelectIcon: 'text-neutral-500',
				tableHeaderCell: 'text-neutral-600',
				positionText: 'text-neutral-900',
				dateText: 'text-neutral-700',
				officeCard: 'bg-neutral-50 border-neutral-200',
			},
		},
	},
});

export interface OfficeItem {
	id: string;
	type: string;
	position: string;
	nextElectionDate: string;
	href?: string;
}

export interface ListOfOfficesBlockProps {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	heading?: string;
	headline?: string;
	defaultYear?: number;
	availableYears?: number[];
	offices: OfficeItem[];
	onYearChange?: (year: number) => void;
	onOfficeClick?: (office: OfficeItem) => void;
}

export function ListOfOfficesBlock(props: ListOfOfficesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const defaultYear = props.defaultYear ?? new Date().getFullYear() + 1;
	const availableYears = props.availableYears ?? [defaultYear - 4, defaultYear - 3, defaultYear - 2, defaultYear - 1, defaultYear];

	const [selectedYear, setSelectedYear] = useState(defaultYear);

	const {
		base,
		wrapper,
		card,
		headerRow,
		headline: headlineStyle,
		yearSelectorWrapper,
		yearLabel,
		yearSelect,
		yearSelectIcon,
		tableWrapper,
		table,
		tableHeader,
		tableHeaderCell,
		tableBody,
		tableRow,
		tableCell,
		typeTag,
		positionText,
		dateText,
		arrowIcon,
		cardList,
		officeCard,
		cardContent,
		cardLeft,
		cardRight,
		desktopTable,
	} = styles({ backgroundColor });

	// Filter offices by selected year (extract year from date string)
	const filteredOffices = useMemo(() => {
		return props.offices.filter(office => {
			const dateYear = new Date(office.nextElectionDate).getFullYear();
			return dateYear === selectedYear;
		});
	}, [props.offices, selectedYear]);

	const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const year = parseInt(e.target.value, 10);
		setSelectedYear(year);
		props.onYearChange?.(year);
	};

	const handleOfficeClick = (office: OfficeItem) => {
		props.onOfficeClick?.(office);
	};

	return (
		<article className={cn(base(), props.className)} data-component="ListOfOfficesBlock">
			<Container size="xl">
				<div className={wrapper()}>


					{/* Main Card */}
					<div className={card()}>
						{/* Header Row: Headline + Year Selector */}
						<div className={headerRow()}>
							{props.headline && (
								<Text as="h3" styleType="heading-md" className={headlineStyle()}>
									{props.headline}
								</Text>
							)}
							<div className={yearSelectorWrapper()}>
								<Text as="label" styleType="subtitle-2" className={yearLabel()} htmlFor="year-select">
									Year
								</Text>
								<div className="relative">
									<select
										id="year-select"
										className={yearSelect()}
										value={selectedYear}
										onChange={handleYearChange}
										aria-label="Select year"
									>
										{availableYears.map(year => (
											<option key={year} value={year}>
												{year}
											</option>
										))}
									</select>
									<IconResolver icon="calendar-days" className={yearSelectIcon()} />
								</div>
							</div>
						</div>

						{/* Desktop Table Layout */}
						{filteredOffices.length > 0 ? (
							<>
								<div className={desktopTable()}>
									<div className={tableWrapper()}>
										<table className={table()}>
											<thead className={tableHeader()}>
												<tr>
													<th className={tableHeaderCell()}>Type</th>
													<th className={tableHeaderCell()}>Position</th>
													<th className={tableHeaderCell()}>Next Election Date</th>
													<th className={tableHeaderCell()} aria-label="Actions"></th>
												</tr>
											</thead>
											<tbody className={tableBody()}>
												{filteredOffices.map(office => {
													return (
														<tr
															key={office.id}
															className={cn(tableRow(), office.href && 'cursor-pointer')}
															onClick={office.href ? () => handleOfficeClick(office) : undefined}
														>
															<td className={tableCell()}>
																{office.href ? (
																	<Anchor href={office.href} className="block">
																		<span className={typeTag()}>{office.type}</span>
																	</Anchor>
																) : (
																	<span className={typeTag()}>{office.type}</span>
																)}
															</td>
															<td className={tableCell()}>
																{office.href ? (
																	<Anchor href={office.href} className="block">
																		<Text styleType="body-2" className={positionText()}>{office.position}</Text>
																	</Anchor>
																) : (
																	<Text styleType="body-2" className={positionText()}>{office.position}</Text>
																)}
															</td>
															<td className={tableCell()}>
																{office.href ? (
																	<Anchor href={office.href} className="block">
																		<Text styleType="body-2" className={dateText()}>{office.nextElectionDate}</Text>
																	</Anchor>
																) : (
																	<Text styleType="body-2" className={dateText()}>{office.nextElectionDate}</Text>
																)}
															</td>
															<td className={tableCell()}>
																{office.href ? (
																	<Anchor href={office.href} className="block">
																		<IconResolver icon="chevron-right" className={arrowIcon()} />
																	</Anchor>
																) : (
																	<IconResolver icon="chevron-right" className={arrowIcon()} />
																)}
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>

								{/* Mobile Card Layout */}
								<div className={cardList()}>
									{filteredOffices.map(office => {
										const CardContent = (
											<div className={cardContent()}>
												<div className={cardLeft()}>
													<span className={typeTag()}>{office.type}</span>
													<Text styleType="body-2" className={positionText()}>{office.position}</Text>
													<Text styleType="body-2" className={dateText()}>{office.nextElectionDate}</Text>
												</div>
												<div className={cardRight()}>
													<IconResolver icon="chevron-right" className={arrowIcon()} />
												</div>
											</div>
										);

										return office.href ? (
											<Anchor key={office.id} href={office.href} onClick={() => handleOfficeClick(office)} className={officeCard()}>
												{CardContent}
											</Anchor>
										) : (
											<div key={office.id} className={officeCard()}>
												{CardContent}
											</div>
										);
									})}
								</div>
							</>
						) : (
							<div className="py-8 text-center">
								<Text styleType="body-2" className="text-neutral-500">
									No offices found for {selectedYear}
								</Text>
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
