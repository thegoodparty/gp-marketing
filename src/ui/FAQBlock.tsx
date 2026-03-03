'use client';

import type { ReactNode } from 'react';
import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';

import { cn, tv } from './_lib/utils.ts';
import type { mediumLargeValues } from './_lib/designTypesStore.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { type ComponentButtonProps } from './Inputs/Button.tsx';
import { Container } from './Container.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Text } from './Text.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';

const styles = tv({
	slots: {
		base: '',
		container: 'flex flex-col gap-12',
		content: 'flex flex-col gap-6',
		trigger: 'group flex items-center justify-between gap-6 text-left w-full p-6',
		copy: 'p-6 pt-0 text-dark',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		hasHeader: {
			true: {
				container: 'md:grid md:grid-cols-[1.5fr_2fr] lg:grid-cols-[1fr_2fr] lg:gap-24',
			},
			false: {},
		},
		layout: {
			blog: {},
			page: {
				base: 'py-(--container-padding)',
			},
		},
	},
});

export type FAQBlockItemProps = {
	id?: string;
	copy: ReactNode;
	title: string;
};

export type FAQBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	buttons?: ComponentButtonProps[];
	className?: string;
	copy?: ReactNode;
	items: FAQBlockItemProps[];
	label?: string;
	size?: (typeof mediumLargeValues)[number];
	title?: string;
	caption?: string;
	header?: HeaderBlockProps;
	layout?: 'blog' | 'page';
};

export function FAQBlock(props: FAQBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const layout = props.layout ?? 'page';

	const { base, container, trigger, copy } = styles({ backgroundColor, layout });

	return (
		<article className={cn(base(), props.className)} data-component='FAQBlock'>
			<Container className={container({ hasHeader: !!props.header })} size={layout === 'blog' ? 'unset' : 'xl'}>
				{props.header && <HeaderBlock {...props.header} backgroundColor={props.backgroundColor} layout='left' />}
				<Root className={`flex flex-col gap-6`} type='multiple'>
					{props.items?.map((item, index) => {
						return (
							<Item
								key={`accordion-item-${item.id}-${index}`}
								value={`accordion-item-${item.id}-${index}`}
								className={`bg-white rounded-lg data-[state="open"]:bg-background- data-[state="open"]:bg-text-`}
							>
								<Header className={`animate-accordion-open`}>
									<Trigger className={trigger()}>
										<Text styleType='subtitle-1'>{item.title}</Text>
										<div className={`grid transition-transform duration-normal ease-smooth group-data-[state=open]:-scale-y-100`}>
											<IconResolver
												icon={'plus'}
												className={`col-start-1 col-end-1 row-start-1 row-end-1 transition-opacity duration-fast ease-smooth group-data-[state=open]:opacity-0`}
											/>
											<IconResolver
												icon={'minus'}
												className={`col-start-1 col-end-1 row-start-1 row-end-1 opacity-0 transition-opacity duration-fast ease-smooth group-data-[state=open]:opacity-100`}
											/>
										</div>
									</Trigger>
								</Header>
								<Content
									className={`overflow-hidden data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-closed `}
								>
									{isValidRichText(item.copy) && (
										<Text className={copy()} styleType='body-2'>
											{item.copy}
										</Text>
									)}
								</Content>
							</Item>
						);
					})}
				</Root>
			</Container>
		</article>
	);
}
