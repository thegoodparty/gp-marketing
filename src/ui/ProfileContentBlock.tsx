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
		// Sidebar clearance for the straddling hero portrait. MUST stay in lockstep
		// with ProfileHero's portrait overhang (overhang = avatarSize − 200):
		// `default` clears the 416px /candidate portrait (216px); `compact` clears
		// the people-profile 320px portrait (120px).
		portrait: {
			default: {},
			compact: {
				sidebar: 'lg:mt-[120px]',
				sidebarStandalone: 'lg:mt-[120px]',
			},
		},
	},
	defaultVariants: {
		portrait: 'default',
	},
});

export type ProfileContentBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	sidebar?: ElectionsSidebarProps;
	title?: string;
	contentCards: ProfileContentCardProps[];
	/** Clears the smaller (320px) people-profile portrait instead of the 416px default. */
	compactPortrait?: boolean;
};

export function ProfileContentBlock(props: ProfileContentBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, well, grid, sidebar, sidebarStandalone, content, title: titleSlot } = styles({ backgroundColor, portrait: props.compactPortrait ? 'compact' : 'default' });
	const hasContentCards = props.contentCards.length > 0;

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentBlock'>
			<Container size='xl'>
				<div className={cn(hasContentCards ? grid() : props.sidebar ? well() : undefined)}>
					{props.sidebar && (
						<aside className={hasContentCards ? sidebar() : sidebarStandalone()}>
							<ElectionsSidebar {...props.sidebar} />
						</aside>
					)}
					{hasContentCards && (
						<div className={cn(content())}>
							{props.title && (
								<Text as='h2' styleType='heading-sm' className={titleSlot()}>
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
