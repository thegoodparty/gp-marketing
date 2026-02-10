'use client';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import type { HeaderBlockProps } from './HeaderBlock.tsx';
import { ArrowRightIcon } from './icons/ArrowRightIcon.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-6',
		card: 'bg-goodparty-cream rounded-lg p-6 md:p-8',
		headerRow: 'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6',
		headline: 'font-primary text-heading-md md:text-heading-lg',
		linksList: 'flex flex-col gap-3',
		linkItem: [
			'group bg-neutral-50 rounded-lg',
			'hover:border-lavender-600 transition-colors',
			'flex items-center justify-between gap-4 px-4 py-4',
			'cursor-pointer',
		],
		linkText: 'font-secondary text-body-2 text-neutral-900 flex-1',
		linkIcon: 'text-neutral-900 flex-shrink-0',
		emptyState: 'py-8 text-center',
		emptyStateText: 'text-neutral-500',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
				card: 'bg-neutral-900 border-lavender-500',
				headline: 'text-white',
				linkItem: 'bg-white border-neutral-700 hover:border-lavender-400',
				linkText: 'text-neutral-900',
				linkIcon: 'text-neutral-900',
				emptyStateText: 'text-neutral-300',
			},
			cream: {
				base: '',
				card: 'bg-goodparty-cream',
				headline: 'text-neutral-900',
				linkItem: 'bg-white border-neutral-200 hover:border-lavender-600',
				linkText: 'text-neutral-900',
				linkIcon: 'text-neutral-900',
				emptyStateText: 'text-neutral-500',
			},
		},
	},
});

export interface FAQLinkItem {
	id: string;
	label: string;
	href?: string;
}

export interface FAQLinksBlockProps {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	items: FAQLinkItem[];
	onLinkClick?: (item: FAQLinkItem) => void;
}

export function FAQLinksBlock(props: FAQLinksBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';

	const {
		base,
		wrapper,
		card,
		headline: headlineStyle,
		linksList,
		linkItem,
		linkText,
		linkIcon,
		emptyState,
		emptyStateText,
	} = styles({ backgroundColor });

	const handleLinkClick = (item: FAQLinkItem) => {
		props.onLinkClick?.(item);
	};

	return (
		<article className={cn(base(), props.className)} data-component="FAQLinksBlock">
			<Container size="xl">
				<div className={wrapper()}>
					{/* Card Container */}
					<div className={card()}>
						{/* Header Section */}
						{props.header && (props.header.title || props.header.copy) && (
							<div className="flex flex-col gap-3 md:gap-4 mb-6">
								{props.header.title && (
									<Text as="h3" styleType="heading-md" className={headlineStyle()}>
										{props.header.title}
									</Text>
								)}
								{props.header.copy && (
									<Text styleType="body-2">
										{props.header.copy}
									</Text>
								)}
							</div>
						)}

						{/* Links List */}
						{props.items.length > 0 ? (
							<ul className={linksList()}>
								{props.items.map(item => {
									const LinkContent = (
										<>
											<Text styleType="body-2" className={linkText()}>
												{item.label}
											</Text>
											<ArrowRightIcon size={32} className={linkIcon()} innerClassName="group-hover:animate-slide-in-right" />
										</>
									);

									return item.href ? (
										<li key={item.id}>
											<Anchor
												href={item.href}
												className={linkItem()}
												onClick={() => handleLinkClick(item)}
											>
												{LinkContent}
											</Anchor>
										</li>
									) : (
										<li key={item.id} className={linkItem()} onClick={() => handleLinkClick(item)}>
											{LinkContent}
										</li>
									);
								})}
							</ul>
						) : (
							<div className={emptyState()}>
								<Text styleType="body-2" className={emptyStateText()}>
									No FAQ links available
								</Text>
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
