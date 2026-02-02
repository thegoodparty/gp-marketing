import Link from 'next/link';
import { Fragment } from 'react';

import type { backgroundTypeValues } from './_lib/designTypesStore';
import { cn, tv } from './_lib/utils';
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
				separator: 'text-neutral-400',
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

export const Breadcrumbs = (props: {
	items?: { href: string; label: string }[];
	backgroundColor?: (typeof backgroundTypeValues)[number];
}) => {
	const crumbs = props.items ?? [];
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const { nav, link, current, separator } = styles({ backgroundColor });

	return (
		<nav className={nav()}>
			{crumbs.map((crumb, i) => (
				<Fragment key={crumb.href}>
					{i > 0 && <IconResolver icon='chevron-right' className={separator()} />}
					{i === crumbs.length - 1 ? (
						<span className={current()}>{crumb.label}</span>
					) : (
						<Link href={crumb.href} className={cn(link())}>
							{crumb.label}
						</Link>
					)}
				</Fragment>
			))}
		</nav>
	);
};
