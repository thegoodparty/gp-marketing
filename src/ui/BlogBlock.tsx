'use client';
import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { BlogCard, type BlogCardProps } from './BlogCard.tsx';
import { Button, ComponentButton } from './Inputs/Button.tsx';
import { Container, type ContainerProps } from './Container.tsx';
import { Text } from './Text.tsx';
import type { HeaderBlockProps } from '~/ui/HeaderBlock.tsx';
import { useState, useTransition } from 'react';
import { loadMoreArticles } from '~/ui/_lib/loadMoreArticles.ts';
import { articleCardGroq } from '~/sanity/groq.ts';
import { resolveBlogCard } from './_lib/resolveBlogCard.ts';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		container: 'flex flex-col gap-12 md:gap-20',
		content: 'flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-end',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type BlogBlockProps = {
	header?: HeaderBlockProps;
	className?: string;
	containerSize?: ContainerProps['size'];
	items: BlogCardProps[];
	fetchProps?: {
		topicID?: string;
		categoryID?: string;
	};
	allItemsCount?: number;
};

export function BlogBlock(props: BlogBlockProps) {
	const backgroundColor = 'cream';
	const { base, container, content } = styles({ backgroundColor });
	const [articles, setArticles] = useState<BlogCardProps[]>(props.items);

	return (
		<article className={cn(base(), props.className)} data-component='BlogBlock'>
			<Container className={container()} size={props.containerSize}>
				{props.header &&
					(props.header.label || props.header.title || props.header.copy || (props.header.buttons && props.header.buttons.length > 0)) && (
						<div className={content()}>
							<div className={`flex flex-col gap-3 md:gap-4`}>
								{props.header.label && (
									<span className='text-neutral-500'>
										<Text as='span' styleType='overline'>
											{props.header.label}
										</Text>
									</span>
								)}
								{props.header.title && (
									<Text as='h2' styleType='heading-lg'>
										{props.header.title}
									</Text>
								)}
								{isValidRichText(props.header.copy) && <Text styleType='body-1'>{props.header.copy}</Text>}
							</div>
							{props.header.buttons && props.header.buttons.length > 0 && (
								<div className={`flex flex-wrap gap-4`}>
									{props.header.buttons.map((item, index) => {
										const resolvedStyle = resolveButtonStyleType(item.buttonProps?.styleType ?? 'primary', backgroundColor);
										return (
											<ComponentButton
												className='max-sm:w-full w-fit'
												key={`${index}-${item.buttonProps?.styleType}-blog-block-button-${item.label}`}
												{...item}
												buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
											/>
										);
									})}
								</div>
							)}
						</div>
					)}
				{articles && articles.length > 0 && (
					<div className='grid gap-6 md:grid-cols-3 lg:gap-8'>
						{articles.map((item, index) => {
							return <BlogCard {...item} key={index} />;
						})}
					</div>
				)}

				{props.fetchProps &&
					(props.fetchProps.categoryID || props.fetchProps.topicID) &&
					props.allItemsCount &&
					props.allItemsCount > (props.fetchProps.categoryID ? articles.length + 3 : articles.length) && (
						<LoadMoreButton
							fetchProps={props.fetchProps}
							allItemsCount={props.allItemsCount}
							articlesLength={articles.length}
							setArticles={setArticles}
						/>
					)}
			</Container>
		</article>
	);
}

function LoadMoreButton(props: {
	fetchProps: { topicID?: string; categoryID?: string };
	allItemsCount: number;
	articlesLength: number;
	setArticles: (articles: BlogCardProps[]) => void;
}) {
	const [isPending, startTransition] = useTransition();

	const [error, setError] = useState<boolean>(false);

	function handleFetchData() {
		startTransition(async () => {
			if (props.fetchProps.categoryID) {
				// need +3 because we already have 3 articles loaded in the component before this one on the page
				const start = props.articlesLength + 3;
				const end = start + 12 <= props.allItemsCount ? start + 12 : props.allItemsCount;
				try {
					const newArticles = await loadMoreArticles({
						query: articlesByCategoryWithPaginationFetchGroq({ category: props.fetchProps.categoryID, start, end }),
					});
					if (newArticles && Array.isArray(newArticles) && newArticles.length > 0) {
						props.setArticles(prevArticles => [...prevArticles, ...newArticles.map(resolveBlogCard).filter(Boolean)]);
					}
				} catch (error) {
					console.error('Failed to fetch:', error);
					setError(true);
				}
			}
			if (props.fetchProps.topicID) {
				const start = props.articlesLength;
				const end = start + 12 <= props.allItemsCount ? start + 12 : props.allItemsCount;
				try {
					const newArticles = await loadMoreArticles({
						query: articlesWithPaginationFetchGroq({ topic: props.fetchProps.topicID, start, end }),
					});
					if (newArticles && Array.isArray(newArticles) && newArticles.length > 0) {
						props.setArticles(prevArticles => [...prevArticles, ...newArticles.map(resolveBlogCard).filter(Boolean)]);
					}
				} catch (error) {
					console.error('Failed to fetch:', error);
					setError(true);
				}
			}
		});
	}

	return (
		<Button
			className='self-center'
			parent='BlogBlock'
			type='button'
			onClick={handleFetchData}
			isLoading={isPending}
			disabled={isPending || error}
		>
			{error ? 'Error fetching' : isPending ? 'Loading...' : 'Load more'}
		</Button>
	);
}

function articlesWithPaginationFetchGroq(props: { topic: string; start: number; end: number }): string {
	return `*[_type=="article"&&("${props.topic}" in editorialContentTags.list_topics[]._ref)] | order(editorialOverview.field_publishedDate desc)[${props.start}...${props.end}]{${articleCardGroq}}`;
}

function articlesByCategoryWithPaginationFetchGroq(props: { category: string; start: number; end: number }): string {
	return `*[_type=="article"&&(editorialContentTags.ref_catgories._ref=="${props.category}")] | order(editorialOverview.field_publishedDate desc)[${props.start}...${props.end}]{${articleCardGroq}}`;
}
