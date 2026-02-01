import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Container } from './Container.tsx';
import { ElectionsSidebar, type ElectionsSidebarProps } from './ElectionsSidebar.tsx';
import { ProfileContentCard, type ProfileContentCardProps } from './ProfileContentCard.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'grid lg:grid-cols-[300px_1fr] gap-8',
		sidebar: 'sticky top-4 self-start',
		content: 'flex flex-col gap-8',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
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
	contentCards: ProfileContentCardProps[];
};

export function ProfileContentBlock(props: ProfileContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, grid, sidebar, content } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentBlock'>
			<Container size='xl'>
				<div className={grid()}>
					{props.sidebar && (
						<aside className={sidebar()}>
							<ElectionsSidebar {...props.sidebar} />
						</aside>
					)}
					<div className={content()}>
						{props.contentCards.map((card, index) => (
							<ProfileContentCard key={index} {...card} />
						))}
					</div>
				</div>
			</Container>
		</article>
	);
}
