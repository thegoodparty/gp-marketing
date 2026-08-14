'use client';
import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { BlogCard, type BlogCardProps } from './BlogCard.tsx';
import { Button, ComponentButton } from './Inputs/Button.tsx';
import { Container, type ContainerProps } from './Container.tsx';
import { Text } from './Text.tsx';
import type { HeaderBlockProps } from '~/ui/HeaderBlock.tsx';
import { useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import { loadMoreCaseStudies } from '~/ui/_lib/loadMoreCaseStudies.ts';
import { caseStudyCardGroq } from '~/sanity/groq.ts';
import { resolveBlogCard, type ResolveBlogCardSource } from './_lib/resolveBlogCard.ts';

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

export type CaseStudiesBlockProps = {
	header?: HeaderBlockProps;
	className?: string;
	containerSize?: ContainerProps['size'];
	items: BlogCardProps[];
	showSeeMoreButton?: boolean;
	allItemsCount?: number;
};

export function CaseStudiesBlock(props: CaseStudiesBlockProps) {
	const backgroundColor = 'cream';
	const { base, container, content } = styles({ backgroundColor });
	const [caseStudies, setCaseStudies] = useState<BlogCardProps[]>(props.items);

	return (
		<article className={cn(base(), props.className)} data-component='CaseStudiesBlock'>
			<Container className={container()} size={props.containerSize}>
				{props.header &&
					(props.header.label || props.header.title || props.header.copy || (props.header.buttons && props.header.buttons.length > 0)) && (
						<div className={content()}>
							<div className={`flex flex-col gap-3 md:gap-4 max-w-[50rem]`}>
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
												key={`${index}-${item.buttonProps?.styleType}-case-studies-block-button-${item.label}`}
												{...item}
												buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
											/>
										);
									})}
								</div>
							)}
						</div>
					)}
				{caseStudies && caseStudies.length > 0 && (
					<div className='grid gap-6 md:grid-cols-3 lg:gap-8'>
						{caseStudies.map((item, index) => {
							return <BlogCard {...item} key={index} />;
						})}
					</div>
				)}

				{props.showSeeMoreButton && props.allItemsCount != null && props.allItemsCount > caseStudies.length && (
					<SeeMoreButton
						allItemsCount={props.allItemsCount}
						caseStudiesLength={caseStudies.length}
						setCaseStudies={setCaseStudies}
					/>
				)}
			</Container>
		</article>
	);
}

function SeeMoreButton(props: {
	allItemsCount: number;
	caseStudiesLength: number;
	setCaseStudies: Dispatch<SetStateAction<BlogCardProps[]>>;
}) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<boolean>(false);

	function handleFetchData() {
		startTransition(async () => {
			const start = props.caseStudiesLength;
			const end = start + 6 <= props.allItemsCount ? start + 6 : props.allItemsCount;
			try {
				const newCaseStudies = await loadMoreCaseStudies({
					query: caseStudiesWithPaginationFetchGroq({ start, end }),
				});
				if (newCaseStudies && Array.isArray(newCaseStudies) && newCaseStudies.length > 0) {
					props.setCaseStudies(prevCaseStudies => [
						...prevCaseStudies,
						...newCaseStudies
							.map(item => resolveBlogCard(item as ResolveBlogCardSource))
							.filter((card): card is BlogCardProps => Boolean(card)),
					]);
				}
			} catch (fetchError) {
				console.error('Failed to fetch:', fetchError);
				setError(true);
			}
		});
	}

	return (
		<Button
			className='self-center'
			parent='CaseStudiesBlock'
			type='button'
			onClick={handleFetchData}
			isLoading={isPending}
			disabled={isPending || error}
		>
			{error ? 'Error fetching' : isPending ? 'Loading...' : 'See more'}
		</Button>
	);
}

function caseStudiesWithPaginationFetchGroq(props: { start: number; end: number }): string {
	return `*[_type=="caseStudy"] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[${props.start}...${props.end}]{${caseStudyCardGroq}}`;
}
