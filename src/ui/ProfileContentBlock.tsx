import { chunkCardGroups } from './_lib/chunkCardGroups.ts';
import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { ElectionsSidebar, type ElectionsSidebarProps } from './ElectionsSidebar.tsx';
import { ProfileContentCard, type ProfileContentCardProps } from './ProfileContentCard.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		// The Figma frames inset this section by 48px, not the full 80px
		// container-padding: the content column starts 48px below the hero's dark band
		// and the next full-width band (CTA / elections) starts 48px below the well.
		// Scale off the same token (0.6x -> 48px at the 1440 desktop the design
		// targets) so it degrades responsively instead of hardcoding 48px on mobile.
		base: 'py-[calc(var(--container-padding)*0.6)]',
		well: 'mx-auto w-full max-w-3xl',
		grid: 'grid w-full mx-auto max-w-3xl gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] lg:gap-10 xl:gap-12 lg:overflow-hidden',
		// On desktop the hero's portrait straddles the band and overflows INTO this
		// section's left column, so the sidebar starts below it (the design puts the
		// first sidebar card 48px under the photo, while the right-hand content column
		// starts 48px under the band). The offset mirrors the portrait's overflow in
		// ProfileHero (imageWrapper -mb): md 104px, lg 216px. It must be MARGIN, not
		// padding — padding would be part of the sticky box and drag a dead zone
		// along as the sidebar sticks on scroll.
		sidebar: 'self-start w-full min-w-0 md:mt-[104px] lg:mt-[216px] lg:max-w-[400px] lg:sticky lg:top-4',
		// Same portrait clearance as `sidebar` — a profile with no content cards still
		// sits under the straddling hero photo, so without this it would be overlapped.
		sidebarStandalone: 'w-full min-w-0 md:mt-[104px] lg:mt-[216px]',
		content: 'flex min-w-0 w-full flex-col gap-8 rounded-xl bg-white p-6',
		// Separated layout (Figma people profiles): a transparent column whose
		// children are individual white cards; the cream page shows through the
		// 24px gaps between them.
		separatedColumn: 'flex min-w-0 w-full flex-col gap-6',
		// The portrait overflows into the FIRST grid column. Normally that column is
		// the <aside>, which clears it; with no sidebar the content column lands
		// there instead — squeezed into the 280-400px track AND under the photo.
		// From `lg` the two-column grid exists, so move content to the wide second
		// column, which is beside the portrait and needs no clearance. Below `lg`
		// the grid is a single stacked column, so clear the overflow the same way
		// the sidebar does (`md` 104px; under `md` the portrait does not overflow).
		columnWithoutSidebar: 'md:mt-[104px] lg:col-start-2 lg:mt-0',
		// Figma card: 16px radius (--radius-lg) white fill; the inner sections
		// carry their own 24px padding (ProfileContentCard), so the card itself
		// only adds the 16px outer inset the frame shows.
		separatedCard: 'flex flex-col rounded-lg bg-white p-4',
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
	backgroundColor?: 'cream' | 'midnight';
	sidebar?: ElectionsSidebarProps;
	title?: string;
	contentCards: ProfileContentCardProps[];
	/**
	 * `joined` (default, used by `/candidate`) stacks every card inside one white
	 * box with hairline dividers. `separated` (people profiles) renders the Figma
	 * layout: adjacent cards sharing a `group` collapse into their own white card,
	 * separated by cream gaps; `raw` cards render standalone without card chrome.
	 */
	cardLayout?: 'joined' | 'separated';
};

export function ProfileContentBlock(props: ProfileContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, well, grid, sidebar, sidebarStandalone, content, separatedColumn, separatedCard, columnWithoutSidebar, title: titleSlot } =
		styles({ backgroundColor });
	const hasContentCards = props.contentCards.length > 0;
	const separated = props.cardLayout === 'separated';
	// Without an <aside> the cards become the grid's first child, so they inherit
	// the slot the hero portrait overflows into. See the slot's comment.
	const contentColumn = props.sidebar ? undefined : columnWithoutSidebar();

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentBlock'>
			<Container size='xl'>
				<div className={cn(hasContentCards ? grid() : props.sidebar ? well() : undefined)}>
					{props.sidebar && (
						<aside className={hasContentCards ? sidebar() : sidebarStandalone()}>
							<ElectionsSidebar {...props.sidebar} />
						</aside>
					)}
					{hasContentCards &&
						(separated ? (
							<div className={cn(separatedColumn(), contentColumn)}>
								{chunkCardGroups(props.contentCards).map((group, gi) =>
									group[0]?.raw ? (
										group.map((card, ci) => <ProfileContentCard key={`${gi}-${ci}`} {...card} />)
									) : (
										<div key={gi} className={cn(separatedCard())} data-component='ProfileContentCardGroup'>
											{group.map((card, ci) => (
												<ProfileContentCard
													key={`${gi}-${ci}`}
													{...card}
													headingStyle={ci === 0 ? 'section' : 'sub'}
													bare
												/>
											))}
										</div>
									),
								)}
							</div>
						) : (
							<div className={cn(content(), contentColumn)}>
								{props.title && (
									<Text as='h2' styleType='heading-sm' className={titleSlot()}>
										{props.title}
									</Text>
								)}
								{props.contentCards.map((card, index) => (
									<ProfileContentCard key={index} {...card} />
								))}
							</div>
						))}
				</div>
			</Container>
		</article>
	);
}
