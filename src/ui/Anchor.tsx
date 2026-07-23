'use client';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { type ComponentProps, forwardRef } from 'react';
import { LinkTarget } from '~/types/ui';
import { useDecoratedAppHref } from '~/ui/AttributionProvider';
// import type { SanityImage } from '~/ui/types';
import { isExternalToEcosystem } from '~/ui/_lib/linkBehavior';

function decodeFragmentId(rawId: string): string {
	try {
		return decodeURIComponent(rawId);
	} catch {
		return rawId;
	}
}

function mergeRelForNewTab(relProp: string | undefined): string {
	const tokens = new Set<string>();
	if (typeof relProp === 'string' && relProp) {
		for (const t of relProp.trim().split(/\s+/)) {
			if (t) tokens.add(t);
		}
	}
	tokens.add('noopener');
	tokens.add('noreferrer');
	return [...tokens].join(' ');
}

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

export const Anchor = forwardRef<HTMLAnchorElement, PropsWithChildren<AnchorProps>>(function Anchor(
	{ children, href, target: targetProp, rel: relProp, ...rest },
	ref,
) {
	const resolvedHref = useDecoratedAppHref(href);
	let scroll = true;
	let url: { href: string | undefined; onClick?: ComponentProps<'a'>['onClick'] | undefined } = {
		href: undefined,
		onClick: undefined,
	};

	const target = targetProp ?? (isExternalToEcosystem(resolvedHref) ? LinkTarget.BLANK : LinkTarget.SELF);
	const rel = target === LinkTarget.BLANK ? mergeRelForNewTab(relProp) : relProp;

	if (typeof resolvedHref === 'string') {
		url = { href: resolvedHref };
	}

	if (!url.href) {
		return (
			<a
				ref={ref}
				{...rest}
				target={target}
				rel={rel}
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
			const fragmentHref = url.href;
			const rawId = fragmentHref.slice(1);
			const id = decodeFragmentId(rawId);
			url.href = '';
			url.onClick = event => {
				event.preventDefault();
				setTimeout(() => {
					const scrollTarget = id === '' || id === 'top' ? document.body : document.getElementById(id);
					scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
				}, 0);
			};
			return (
				<a ref={ref} href={fragmentHref} {...rest} target={target} rel={rel} onClick={url.onClick}>
					{children}
				</a>
			);
		} else {
			scroll = true;
		}
	}

	return (
		<Link ref={ref} href={url.href} onClick={url.onClick} {...rest} target={target} rel={rel} scroll={scroll} prefetch={false}>
			{children}
		</Link>
	);
});
