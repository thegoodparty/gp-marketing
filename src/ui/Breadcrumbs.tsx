'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';

import { cn, tv } from './_lib/utils';
import type { BreadcrumbBackgroundColor, BreadcrumbItem } from './BreadcrumbBlock';
import { IconResolver } from './IconResolver';

const styles = tv({
	slots: {
		nav: 'flex items-center flex-wrap gap-1 text-sm',
		link: '',
		current: '',
		separator: 'flex-shrink-0',
		// The "..." standing in for the hidden middle of the trail on the phone.
		// A button, because pressing it reveals the rest of the trail in place.
		ellipsis: 'md:hidden',
	},
	variants: {
		backgroundColor: {
			midnight: {
				nav: 'text-neutral-400',
				link: 'hover:text-white',
				current: 'text-white',
				separator: 'text-white',
				ellipsis: 'hover:text-white',
			},
			cream: {
				nav: 'text-neutral-500',
				link: 'hover:text-black',
				current: 'text-black',
				separator: 'text-neutral-500',
				ellipsis: 'hover:text-black',
			},
		},
		// The Voter Guide phone frames (2139:26708 profile, 2139:21609 position):
		// Open Sans 14/20, 6px between items, 15px chevrons. Desktop keeps the
		// sizes it has.
		compact: {
			true: {
				nav: 'max-md:gap-1.5 max-md:text-[0.875rem]/[1.25rem]',
				separator: 'max-md:min-w-[15px] max-md:min-h-[15px] max-md:w-[15px] max-md:h-[15px] max-md:max-w-[15px] max-md:max-h-[15px]',
			},
		},
	},
});

export function shouldRenderBreadcrumbLink(
	crumb: BreadcrumbItem,
	index: number,
	total: number,
): boolean {
	return index < total - 1 && Boolean(crumb.href);
}

export function getBreadcrumbItemKey(crumb: BreadcrumbItem, index: number): string {
	return crumb.id ?? `${index}-${crumb.href ?? 'current'}-${crumb.label}`;
}

/**
 * Whether a crumb is folded into the "..." on the phone: everything between the
 * first and the last, and only when there is something to fold.
 */
export function isCollapsedBreadcrumb(index: number, total: number): boolean {
	return total > 2 && index > 0 && index < total - 1;
}

export const Breadcrumbs = (props: {
	items?: BreadcrumbItem[];
	backgroundColor?: BreadcrumbBackgroundColor;
	/**
	 * Voter Guide treatment on the phone (Emily, 2026-10-06): the trail shows its
	 * first and last crumb with a "..." between them that expands the rest on
	 * tap, at the frames' phone sizes. Every crumb stays in the DOM, so the
	 * links and the BreadcrumbList schema are unchanged. Off by default: the
	 * blog and glossary pages share this component and were not in the round.
	 */
	collapseOnMobile?: boolean;
}) => {
	const crumbs = props.items ?? [];
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const [expanded, setExpanded] = useState(false);
	const collapsed = props.collapseOnMobile === true && !expanded;
	const { nav, link, current, separator, ellipsis } = styles({ backgroundColor, compact: props.collapseOnMobile === true });

	return (
		<nav className={nav()}>
			{crumbs.map((crumb, i) => {
				const isLast = i === crumbs.length - 1;
				const showLink = shouldRenderBreadcrumbLink(crumb, i, crumbs.length);
				const folded = collapsed && isCollapsedBreadcrumb(i, crumbs.length);

				return (
					<Fragment key={getBreadcrumbItemKey(crumb, i)}>
						{i === 1 && collapsed && crumbs.length > 2 && (
							<span className={cn('contents', ellipsis())}>
								<IconResolver icon='chevron-right' className={separator()} />
								<button
									type='button'
									className={ellipsis()}
									aria-label='Show the full trail'
									aria-expanded={false}
									onClick={() => setExpanded(true)}
								>
									...
								</button>
							</span>
						)}
						<span className={folded ? 'hidden md:contents' : 'contents'}>
							{i > 0 && <IconResolver icon='chevron-right' className={separator()} />}
							{showLink ? (
								<Link href={crumb.href!} className={cn(link())}>
									{crumb.label}
								</Link>
							) : (
								<span className={isLast ? current() : undefined}>{crumb.label}</span>
							)}
						</span>
					</Fragment>
				);
			})}
		</nav>
	);
};
