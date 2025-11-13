import Link from 'next/link';

import { IconResolver } from './IconResolver';
import { Fragment } from 'react';

export const Breadcrumbs = (props: { items?: { href: string; label: string }[] }) => {
	const crumbs = props.items ?? [];

	return (
		<nav className='flex items-center flex-wrap gap-1 text-sm text-slate-400'>
			{crumbs.map((crumb, i) => (
				<>
					{i > 0 && <IconResolver icon='chevron-right' />}
					<Fragment key={crumb.href}>
						{i === crumbs.length - 1 ? (
							<span className='text-white'>{crumb.label}</span>
						) : (
							<Link href={crumb.href} className='hover:text-white'>
								{crumb.label}
							</Link>
						)}
					</Fragment>
				</>
			))}
		</nav>
	);
};
