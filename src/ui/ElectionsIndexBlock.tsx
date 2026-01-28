'use client';
import { useState, useMemo } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { Anchor } from './Anchor.tsx';
import { Text } from './Text.tsx';
import { Button } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-12 md:gap-16',
		searchWrapper: 'w-full max-w-xl mx-auto',
		searchInput:
			'w-full px-4 py-3 pr-12 rounded-lg font-secondary text-text-md transition-colors focus:outline-none focus:ring-2',
		searchContainer: 'relative',
		searchIcon: 'absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5',
		resultCount: 'text-center',
		grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3',
		locationLink: 'font-secondary text-text-md py-1 transition-colors hover:opacity-70',
		footer: 'flex justify-center',
		emptyState: 'text-center py-8',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
				searchInput:
					'bg-midnight-800 border border-midnight-700 text-white placeholder:text-neutral-400 focus:ring-white/30',
				searchIcon: 'text-neutral-400',
				locationLink: 'text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
				searchInput:
					'bg-white border border-neutral-300 text-black placeholder:text-neutral-500 focus:ring-blue-500/30',
				searchIcon: 'text-neutral-500',
				locationLink: 'text-black',
			},
		},
	},
});

// API Response Types
export interface ElectionsLocationResponse {
	currentLocation: {
		level: 'state' | 'county';
		name: string;
		slug: string;
		state: string;
	};
	childLocations: Array<{
		name: string;
		slug: string;
		level: 'county' | 'city';
	}>;
}

// Component Props
export interface ElectionItem {
	name: string;
	href: string;
	level: 'county' | 'city';
}

export interface ElectionsIndexBlockProps {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	elections: ElectionItem[];
	stateSlug: string;
	countySlug?: string;
	citySlug?: string;
	initialDisplayCount?: number;
	showSearch?: boolean;
	searchPlaceholder?: string;
	ctaLabel?: string;
	ctaHref?: string;
}

export function ElectionsIndexBlock(props: ElectionsIndexBlockProps) {
	// Return null for city pages - component should not render
	if (props.citySlug) {
		return null;
	}

	const backgroundColor = props.backgroundColor ?? 'midnight';
	const initialDisplayCount = props.initialDisplayCount ?? 24;
	const showSearch = props.showSearch ?? true;
	const searchPlaceholder = props.searchPlaceholder ?? 'Search by county or municipality';

	const {
		base,
		wrapper,
		searchWrapper,
		searchInput,
		searchContainer,
		searchIcon,
		resultCount,
		grid,
		locationLink,
		footer,
		emptyState,
	} = styles({ backgroundColor });

	const [searchQuery, setSearchQuery] = useState('');
	const [displayCount, setDisplayCount] = useState(initialDisplayCount);

	// Sort elections alphabetically and filter by search
	const filteredElections = useMemo(() => {
		const sorted = [...props.elections].sort((a, b) => a.name.localeCompare(b.name));

		if (!searchQuery.trim()) {
			return sorted;
		}

		const query = searchQuery.toLowerCase().trim();
		return sorted.filter(election => election.name.toLowerCase().includes(query));
	}, [props.elections, searchQuery]);

	// Get elections to display based on pagination
	const displayedElections = useMemo(() => {
		return filteredElections.slice(0, displayCount);
	}, [filteredElections, displayCount]);

	const hasMore = displayCount < filteredElections.length;
	const totalCount = filteredElections.length;

	const handleShowMore = () => {
		setDisplayCount(prev => prev + initialDisplayCount);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		setDisplayCount(initialDisplayCount); // Reset pagination when searching
	};

	const resolvedButtonStyle = resolveButtonStyleType('primary', backgroundColor);

	return (
		<article className={cn(base(), props.className)} data-component="ElectionsIndexBlock">
			<Container size="xl">
				<div className={wrapper()}>
					{/* Header Section */}
					{props.header && (props.header.label || props.header.title || isValidRichText(props.header.copy)) && (
						<HeaderBlock {...props.header} backgroundColor={backgroundColor} layout="center" />
					)}

					{/* Search Section */}
					{showSearch && (
						<div className={searchWrapper()}>
							<div className={searchContainer()}>
								<input
									type="text"
									placeholder={searchPlaceholder}
									value={searchQuery}
									onChange={handleSearchChange}
									className={searchInput()}
									aria-label="Search locations"
								/>
								<IconResolver icon="search" className={searchIcon()} />
							</div>
						</div>
					)}

					{/* Result Count */}
					<div className={resultCount()}>
						<Text as="span" styleType="body-2">
							{totalCount.toLocaleString()} Available Results
						</Text>
					</div>

					{/* Elections Grid */}
					{displayedElections.length > 0 ? (
						<nav aria-label="Elections by location">
							<ul className={grid()}>
								{displayedElections.map((election, index) => (
									<li key={`${election.href}-${index}`}>
										<Anchor href={election.href} className={locationLink()}>
											{election.name}
										</Anchor>
									</li>
								))}
							</ul>
						</nav>
					) : (
						<div className={emptyState()}>
							<Text styleType="body-1">
								{searchQuery
									? `No results found for "${searchQuery}"`
									: 'No locations found'}
							</Text>
						</div>
					)}

					{/* Show More / CTA Button */}
					<div className={footer()}>
						{hasMore ? (
							<Button
								parent="ElectionsIndexBlock"
								type="button"
								onClick={handleShowMore}
								styleType={resolvedButtonStyle}
								iconRight={
									<IconResolver
										icon="arrow-up-right"
										className="min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5"
									/>
								}
							>
								{props.ctaLabel ?? 'Browse CTA'}
							</Button>
						) : props.ctaHref ? (
							<Anchor href={props.ctaHref}>
								<Button
									parent="ElectionsIndexBlock"
									type="button"
									styleType={resolvedButtonStyle}
									iconRight={
										<IconResolver
											icon="arrow-up-right"
											className="min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5"
										/>
									}
								>
									{props.ctaLabel ?? 'Browse All'}
								</Button>
							</Anchor>
						) : null}
					</div>
				</div>
			</Container>
		</article>
	);
}
