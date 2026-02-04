'use client';

import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import type { HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-6',
		card: 'bg-goodparty-cream rounded-lg p-6 md:p-8',
		headerRow: 'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6',
		headline: 'font-primary text-heading-md md:text-heading-lg',
		linksList: 'flex flex-col gap-3',
		linkItem: [
			'bg-neutral-50 rounded-lg',
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
				linkText: 'text-white',
				linkIcon: 'text-white',
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
											<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={linkIcon()}>
												<path d="M23.057 9.72256C23.5777 9.20186 24.4217 9.20186 24.9424 9.72256L30.2757 15.0559C30.7964 15.5766 30.7964 16.4206 30.2757 16.9413L24.9424 22.2746C24.4217 22.7953 23.5777 22.7953 23.057 22.2746C22.5363 21.7539 22.5363 20.9099 23.057 20.3892L26.1143 17.3319H2.66634C1.92996 17.3319 1.33301 16.735 1.33301 15.9986C1.33301 15.2622 1.92996 14.6653 2.66634 14.6653H26.1143L23.057 11.608C22.5363 11.0873 22.5363 10.2433 23.057 9.72256Z" fill="currentColor"/>
											</svg>
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
