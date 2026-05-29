import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Container } from './Container.tsx';
import { ElectionsSidebar, type ElectionsSidebarProps } from './ElectionsSidebar.tsx';
import { ProfileContentCard, type ProfileContentCardProps } from './ProfileContentCard.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'grid w-full mx-auto max-w-3xl gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] lg:gap-10 xl:gap-12 lg:overflow-hidden',
		sidebar: 'self-start w-full min-w-0 lg:max-w-[400px] lg:sticky lg:top-4',
		content: 'flex min-w-0 w-full flex-col gap-8 rounded-xl bg-white p-6',
		title: 'border-b border-gray-200 ',
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
	},
});

export type ProfileContentBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	sidebar?: ElectionsSidebarProps;
	title?: string;
	contentCards: ProfileContentCardProps[];
};

export function ProfileContentBlock(props: ProfileContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, sidebar, content, title: titleSlot } = styles({ backgroundColor });
	const hasContentCards = props.contentCards.length > 0;

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentBlock'>
			<Container size='xl'>
				<div
					className={cn(
						hasContentCards
							? grid()
							: props.sidebar
								? 'mx-auto w-full max-w-3xl'
								: undefined,
					)}
				>
					{props.sidebar && (
						<aside className={sidebar()}>
							<ElectionsSidebar {...props.sidebar} />
						</aside>
					)}
					{hasContentCards && (
						<div className={cn(content())}>
							{props.title && (
								<Text as="h2" styleType="heading-sm" className={titleSlot()}>
									{props.title}
								</Text>
							)}
							{props.contentCards.map((card, index) => (
								<ProfileContentCard key={index} {...card} />
							))}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
