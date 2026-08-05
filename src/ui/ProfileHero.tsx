import Image from 'next/image';
import { cn, tv } from './_lib/utils.ts';
import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import type { SanityImage } from './types.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		// Cream is the page background the hero blends into below the short dark band.
		// On desktop the portrait STRADDLES the band: it overflows the hero box so the
		// following content well can start 48px below the band (as the Figma frames do)
		// instead of below the full photo. overflow-visible lets it show; z-10 keeps it
		// painted above the next section's cream background (later sibling in the DOM).
		// Mobile keeps overflow-hidden — the band bleeds past the container there.
		base: 'relative overflow-hidden text-white md:overflow-visible md:z-10',
		// Extra bleed on mobile so the band reaches the viewport edges.
		backgroundWrapper: 'absolute inset-0 max-md:-left-[var(--container-padding)] max-md:-right-[var(--container-padding)]',
		// Short dark band. On mobile it covers the whole hero (h-full) so stacked
		// text stays readable; on desktop it is a short band the photo straddles.
		band: 'absolute inset-x-0 top-0 h-full md:h-[224px] lg:h-[240px]',
		// Cream fill below the band on desktop (blends into the following section).
		belowBand: 'absolute inset-x-0 bottom-0 top-[224px] lg:top-[240px] max-md:hidden bg-goodparty-cream',
		container: 'relative z-10 flex flex-col items-start gap-6 pt-8 pb-10 md:flex-row md:items-start md:gap-12 lg:gap-16 md:pt-10 md:pb-0',
		// The negative bottom margin is the portrait's OVERFLOW below the hero: it caps
		// how much height the photo contributes to the flow (md 288-184=104, lg 416-200=216)
		// so the hero box ends at the band, while the photo still renders past it. The
		// sidebar column in ProfileContentBlock offsets by the same amount to clear it.
		imageWrapper: 'relative z-20 flex-shrink-0 md:-mb-[104px] lg:-mb-[216px]',
		// Circular portrait straddling the dark band and the cream content below.
		image: 'relative rounded-full overflow-hidden w-40 h-40 md:w-72 md:h-72 lg:w-[416px] lg:h-[416px]',
		// GoodParty logo overlaid on the photo's bottom-right corner. Sized as a
		// fraction of the portrait per Figma (desktop glyph 113x94 on the 416px
		// avatar; mobile 48x40 on the 144px avatar), so it scales across breakpoints.
		badge: 'absolute bottom-1 right-1 z-30 drop-shadow-md w-12 h-10 md:w-20 md:h-[66px] lg:w-[113px] lg:h-[94px]',
		// Tighter rhythm than before so the attribution sits higher in the band,
		// leaving more dark space beneath "Empowered by GoodParty.org" (Figma).
		content: 'flex flex-col gap-2 text-left z-10 md:pt-2',
		tagRow: 'flex flex-wrap items-center gap-2',
		// Pill CONTAINER only (shape + border/text-color). The FILL is applied per
		// tag in the render (Incumbent → halo-green, Candidate → bright-yellow) and
		// the text size lives on an inner span, NOT here: our tailwind-merge collapses
		// any text-size against a text-color in the same pass and keeps the color, so
		// size + color must be separate elements.
		tag: 'inline-flex w-fit items-center rounded-[6px] border px-2.5 py-1 shadow-xs',
		// Inner text span: 14px medium Open Sans (Figma tag). No color here → nothing
		// for merge to collapse it against; color is inherited from the container.
		tagText: 'font-secondary text-[0.875rem] font-medium',
		nameOffice: 'flex flex-col gap-1',
		heading: '',
		// Figma office line is Outfit Medium (500), not the subtitle-1 default (600).
		office: 'font-medium',
		officeLink: 'hover:underline',
		// Container carries the text COLOR (via variant); the inner span carries the
		// size/weight so tailwind-merge can't collapse them into one another.
		attribution: 'mt-1 flex items-center justify-start gap-1.5',
		attributionIcon: 'w-[37px] h-[28px]',
		// Figma "Empowered by GoodParty.org": Outfit SemiBold 20/28.
		attributionText: 'font-primary text-[1.25rem] font-semibold leading-7',
		notEndorsed: 'text-sm',
	},
	variants: {
		backgroundColor: {
			midnight: {
				// Figma hero band: a midnight→blue diagonal gradient. Figma's stops
				// (68.4% / 125.1%) were measured on its full-height hero frame; on our
				// short dark band those push the bright-blue stop off-canvas so it
				// reads as one flat color. The stops are re-fit here to transition
				// within the band (dark top for legibility → blue by the lower edge).
				// The bright stop is the --goodparty-blue-bright token (colors.css).
				band: 'bg-[linear-gradient(156.73deg,var(--midnight-900)_30%,var(--goodparty-blue-bright))]',
				heading: 'text-white',
				office: 'text-white',
				attribution: 'text-white',
				tag: 'border-gray-300 text-[color:#0a0a0a]',
				notEndorsed: 'text-gray-400',
			},
			cream: {
				base: 'text-midnight-900',
				band: 'bg-goodparty-cream',
				heading: 'text-midnight-900',
				office: 'text-midnight-900',
				attribution: 'text-midnight-900',
				tag: 'bg-white border-gray-300 text-[color:#0a0a0a]',
				notEndorsed: 'text-gray-500',
			},
		},
	},
});

export type ProfileHeroProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	candidateName: string;
	office: string;
	/** When set, the office line renders as a link to the office/position page. */
	officeHref?: string;
	profileImage?: SanityImage;
	profileImageUrl?: string;
	isEmpowered?: boolean;
	/** Persona tag pills rendered above the name (e.g. "Candidate", "Incumbent"). Renders nothing when empty. */
	tags?: string[];
	/**
	 * Attribution row under the office line. When omitted it falls back to
	 * `isEmpowered` (empowered → "Empowered by GoodParty.org", otherwise none).
	 */
	attribution?: 'empowered' | 'notEndorsed' | 'none';
};

export function ProfileHero(props: ProfileHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const resolvedBackgroundColor = backgroundColor === 'white' ? 'cream' : backgroundColor;
	const { base, backgroundWrapper, band, belowBand, container, imageWrapper, image, badge, content, tagRow, tag, tagText, nameOffice, heading, office, officeLink, attribution, attributionIcon, attributionText, notEndorsed } = styles({ backgroundColor: resolvedBackgroundColor });

	// `attribution` wins when provided; otherwise fall back to legacy `isEmpowered`.
	const attributionMode = props.attribution ?? (props.isEmpowered ? 'empowered' : 'none');
	const tags = props.tags?.filter(Boolean) ?? [];

	// Per Figma the persona pill is colour-coded by label: an in-office "Incumbent"
	// reads halo-green, everyone else (Candidate / Former Official) reads bright-yellow.
	const tagFill = (label: string): string => (label === 'Incumbent' ? 'bg-halo-green-50' : 'bg-bright-yellow-50');

	return (
		<section className={cn(base(), props.className)} data-component="ProfileHero">
			<div className={backgroundWrapper()}>
				<div className={band()} />
				<div className={belowBand()} />
			</div>
			<Container size="xl">
				<div className={container()}>
					<div className={imageWrapper()}>
						<div className={image()}>
							{props.profileImageUrl ? (
								<Image
									src={props.profileImageUrl}
									alt={`${props.candidateName} headshot`}
									fill
									unoptimized
									className="object-cover object-center"
								/>
							) : props.profileImage ? (
								<ResponsiveImage image={props.profileImage} />
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 512 512"
										className="w-1/2 h-1/2"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M256 256a112 112 0 1 0-112-112 112 112 0 0 0 112 112zm0 32c-69.42 0-208 42.88-208 128v64h416v-64c0-85.12-138.58-128-208-128z" />
									</svg>
								</div>
							)}
						</div>
						{attributionMode === 'empowered' && (
							<Logo className={badge()} />
						)}
					</div>
					<div className={content()}>
						{tags.length > 0 && (
							<div className={tagRow()}>
								{tags.map((label) => (
									<span key={label} className={cn(tag(), tagFill(label))}>
										<span className={tagText()}>{label}</span>
									</span>
								))}
							</div>
						)}
						<div className={nameOffice()}>
							<Text as="h1" styleType={props.candidateName.length > 28 ? 'heading-md' : 'heading-lg'} className={heading()}>
								{props.candidateName}
							</Text>
							<Text as="p" styleType="subtitle-1" className={office()}>
								{props.officeHref ? (
									<Anchor href={props.officeHref} className={officeLink()}>
										{props.office}
									</Anchor>
								) : (
									props.office
								)}
							</Text>
						</div>
						{attributionMode === 'empowered' && (
							<div className={attribution()}>
								<Logo className={attributionIcon()} />
								<span className={attributionText()}>Empowered by GoodParty.org</span>
							</div>
						)}
						{attributionMode === 'notEndorsed' && (
							<Text as="span" styleType="body-2" className={notEndorsed()}>
								Not Endorsed by GoodParty.org
							</Text>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}
