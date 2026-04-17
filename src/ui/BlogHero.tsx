'use client';
import { useMemo, useState, type ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { Text } from './Text.tsx';
import { Container } from '~/ui/Container.tsx';
import { Anchor } from '~/ui/Anchor.tsx';
import { usePathname } from 'next/navigation';
import {
	ComboBox as AreaComboBox,
	Label as AreaLabel,
	Input as AreaInput,
	Button as AreaButton,
	Popover as AreaPopover,
	ListBox as AreaListBox,
	ListBoxItem as AreaListBoxItem,
	Text as AreaText,
} from 'react-aria-components';
import { useRouter } from 'next/navigation';
import { useFilter } from 'react-aria';
import { IconResolver } from '~/ui/IconResolver.tsx';

export const stylesBlogHero = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))] md:pb-[3rem]',
		content: 'flex flex-col w-full',
		overline: 'text-neutral-500',
		category: 'py-[0.625rem] px-[1.5rem] rounded-full transition-colors duration-normal ease-smooth',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				overline: 'text-neutral-400',
			},
		},
		activeCategory: {
			true: {
				category: 'bg-black/100 text-white',
			},
			false: {
				category: 'bg-black/0 text-black hover:bg-black/5',
			},
		},
	},
});

export type BlogHeroProps = {
	categories?: { _id: string; title: string; href: string }[] | null;
	articles: { _id: string; title: string; href: string }[] | null;
	backgroundColor?: 'cream' | 'midnight';
	className?: string;
	title?: string;
	copy?: ReactNode;
};

export function BlogHero(props: BlogHeroProps) {
	const pathname = usePathname();
	const categories = [{ _id: 'latest-articles', title: 'Latest Articles', href: '/blog' }, ...(props.categories ?? [])];

	const backgroundColor = props.backgroundColor ?? 'cream';

	const { base, content } = stylesBlogHero({ backgroundColor });

	return (
		<div className={cn(base(), props.className)} data-component='HeaderBlock'>
			<Container size='xl' className={content()}>
				<div className='flex flex-col gap-3 md:gap-4'>
					{props.title && (
						<Text as='h1' styleType='heading-lg'>
							{props.title}
						</Text>
					)}
					{isValidRichText(props.copy) && (
						<Text styleType='body-1' className='max-w-[43.75rem]'>
							{props.copy}
						</Text>
					)}
					<div className='grid grid-cols-1 md:grid-cols-[auto_16rem] lg:grid-cols-[auto_20rem] gap-x-4 gap-y-6 pt-[1.5rem] md:pt-[3rem] md:pb-[3rem]'>
						<div className='flex flex-wrap items-center gap-x-2 gap-y-8'>
							{categories.map((item, index) => {
								const { category } = stylesBlogHero({ backgroundColor, activeCategory: pathname === item.href });
								return (
									<Text as='span' key={`${item._id}-${index}-${item?.title}`} styleType='text-sm'>
										<Anchor href={item.href} className={category()}>
											{item.title}
										</Anchor>
									</Text>
								);
							})}
						</div>
						{props.articles && props.articles.length > 0 && <CategoryAutocomplete items={props.articles} />}
					</div>
				</div>
				<hr className='hidden md:block border-neutral-200' />
			</Container>
		</div>
	);
}

type Article = { _id: string; title: string; href: string };

export function CategoryAutocomplete({ items }: { items: Article[] }) {
	const router = useRouter();
	const [inputValue, setInputValue] = useState('');
	const filter = useFilter({ sensitivity: 'base' });

	const filtered = useMemo(() => items.filter(c => filter.contains(c.title, inputValue)), [items, inputValue, filter]);

	return (
		<div className='w-full max-w-[24rem] md:max-w-[16rem] lg:max-w-[20rem]'>
			<AreaComboBox
				inputValue={inputValue}
				onInputChange={setInputValue}
				menuTrigger='input'
				allowsCustomValue={false}
				className='group flex flex-col gap-2'
				onSelectionChange={key => {
					const chosen = items.find(c => c._id === key);
					if (chosen) router.push(chosen.href);
				}}
			>
				<AreaLabel className='text-sm font-medium' hidden>
					Search articles
				</AreaLabel>

				<div className='relative'>
					<AreaInput
						placeholder='Search'
						className='w-full rounded-[0.5rem] border border-gray-300 pl-[2rem] pr-2 py-2 outline-none focus:border-gray-400 bg-white'
						onKeyDown={e => {
							if (e.key === 'Enter' && filtered.length > 0) {
								router.push(filtered[0]!.href);
							}
						}}
					/>
					<AreaButton slot='trigger' aria-label='Toggle' className='absolute left-1 top-1/2 -translate-y-1/2 p-2'>
						<IconResolver icon='search' className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5' />
					</AreaButton>
					{inputValue.length > 0 && (
						<AreaButton
							slot='clear'
							aria-label='Clear'
							className='absolute right-2 top-1/2 -translate-y-1/2 rounded-[0.5rem] px-2 py-2 hover:bg-gray-100'
							onClick={() => setInputValue('')}
						>
							<IconResolver icon='x' className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5' />
						</AreaButton>
					)}
				</div>

				<AreaPopover
					placement='bottom start'
					className='w-full max-w-[24rem] md:max-w-[16rem] lg:max-w-[20rem] p-[0.5rem] rounded-[0.5rem] bg-white shadow-xl-duo '
				>
					<AreaListBox className='max-h-60 overflow-auto outline-none'>
						{filtered.map((item, index) => (
							<AreaListBoxItem
								key={`${item._id}-${item.title.slice(0, 10)}-${index}`}
								id={`${item._id}-${item.title.slice(0, 10)}-${index}`}
								textValue={item.title}
								className='relative group cursor-pointer w-full flex flex-row items-center gap-[0.5rem] py-[0.75rem] px-[0.625rem] text-black hover:bg-midnight-100 transition-colors duration-normal ease-smooth rounded-[0.375rem] font-semibold'
							>
								<Text as='div' styleType='text-sm' className='font-medium'>
									<Anchor href={item.href} className='before:content-[""] before:absolute before:inset-0'>
										{item.title}
									</Anchor>
								</Text>
							</AreaListBoxItem>
						))}
						{filtered.length === 0 && (
							<AreaText slot='noResults' className='block px-3 py-2 text-sm text-gray-500'>
								No results
							</AreaText>
						)}
					</AreaListBox>
				</AreaPopover>
			</AreaComboBox>
		</div>
	);
}
