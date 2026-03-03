'use client';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { type ComponentProps, forwardRef } from 'react';
// import type { SanityImage } from '~/ui/types';

export type LinkShape = {
	label?: string | null;
	icon?: string | null;
	link?: {
		_id?: string;
		_type?: string;
		name?: string | null;
		label?: string | null;
		title?: string | null;
		// slug?: string | null;
		// copy?: null;
		// featuredImage?: SanityImage | null;
		// publishedDate?: string | null;
		// authors?:
		// 	| {
		// 			personName?: string | null;
		// 			jobTitleOrRole?: string | null;
		// 			field_shortBio?: string | null;
		// 			profilePicture?: SanityImage;
		// 	  }[]
		// 	| null;
		// topics?:
		// 	| {
		// 			_id?: string;
		// 			title?: string | null;
		// 			slug?: string | null;
		// 	  }[]
		// 	| null;
		// category?: {
		// 	_id?: string;
		// 	title?: string | null;
		// 	slug?: string | null;
		// } | null;
		href?: string | null;
	};
};

export type AnchorProps = Omit<ComponentProps<'a'>, 'href' | 'ref'> & {
	href: string | undefined /** for debugging purposes */;
};

export const Anchor = forwardRef<HTMLAnchorElement, PropsWithChildren<AnchorProps>>(function Anchor({ children, href, ...props }, ref) {
	let scroll = true;
	let url: { href: string | undefined; onClick?: ComponentProps<'a'>['onClick'] | undefined } = {
		href: undefined,
		onClick: undefined,
	};

	const internal = href ? /^\/(?!\/)/.test(href) : true;

	const target = props.target ? props.target : internal ? '_self' : '_blank';

	if (typeof href === 'string') {
		url = { href };
	}

	if (!url.href) {
		return (
			<a
				ref={ref}
				{...props}
				onClick={url.onClick}
				href={url.onClick ? '#' : undefined}
				style={{ cursor: url.onClick ? 'pointer' : undefined }}
			>
				{children}
			</a>
		);
	}

	if (url.href.includes('#')) {
		if (url.href.startsWith('#')) {
			const id = String(url.href).replace('#', '');
			url.href = '';
			url.onClick = event => {
				event.preventDefault();
				setTimeout(() => {
					const element = document.getElementById(id);
					element?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
				}, 0);
			};
			return (
				<a ref={ref} href={href} {...props} onClick={url.onClick}>
					{children}
				</a>
			);
		} else {
			scroll = true;
		}
	}

	return (
		<Link ref={ref} href={url.href} onClick={url.onClick} target={target} {...props} scroll={scroll} prefetch={false}>
			{children}
		</Link>
	);
});
