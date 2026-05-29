import Link from 'next/link';
import { Fragment } from 'react';

import { cn, tv } from './_lib/utils';
import type { BreadcrumbBackgroundColor, BreadcrumbItem } from './BreadcrumbBlock';
import { IconResolver } from './IconResolver';

const styles = tv({
	slots: {
		nav: 'flex items-center flex-wrap gap-1 text-sm',
		link: '',
		current: '',
		separator: 'flex-shrink-0',
	},
	variants: {
		backgroundColor: {
			midnight: {
				nav: 'text-neutral-400',
				link: 'hover:text-white',
				current: 'text-white',
				separator: 'text-white',
			},
			cream: {
				nav: 'text-neutral-500',
				link: 'hover:text-black',
				current: 'text-black',
				separator: 'text-neutral-500',
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

export const Breadcrumbs = (props: {
	items?: BreadcrumbItem[];
	backgroundColor?: BreadcrumbBackgroundColor;
}) => {
	const crumbs = props.items ?? [];
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const { nav, link, current, separator } = styles({ backgroundColor });

	return (
		<nav className={nav()}>
			{crumbs.map((crumb, i) => {
				const isLast = i === crumbs.length - 1;
				const showLink = shouldRenderBreadcrumbLink(crumb, i, crumbs.length);

				return (
					<Fragment key={getBreadcrumbItemKey(crumb, i)}>
						{i > 0 && <IconResolver icon='chevron-right' className={separator()} />}
						{showLink ? (
							<Link href={crumb.href!} className={cn(link())}>
								{crumb.label}
							</Link>
						) : (
							<span className={isLast ? current() : undefined}>{crumb.label}</span>
						)}
					</Fragment>
				);
			})}
		</nav>
	);
};
