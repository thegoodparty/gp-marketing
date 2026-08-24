import Image from 'next/image';
import { cn, tv } from './_lib/utils.ts';
import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import type { SanityImage } from './types.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { ATTRIBUTION_COPY, type AttributionMode } from './_lib/attributionCopy.ts';
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
		// Office lines stack flush (Figma sets them on consecutive 32px lines with
		// no gap) even when a second line is present.
		officeLines: 'flex flex-col',
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
		attributionMuted: 'text-sm',
	},
	variants: {
		backgroundColor: {
			midnight: {
				// Figma hero band: a soft blue glow rising from the BOTTOM-CENTER over
				// a midnight field (not a linear top→bottom ramp — that read wrong at
				// both the top corners and the edges). This radial is fit by VALUE:
				// sampling Figma's rendered band on a 5×5 grid and minimizing RGB error
				// gives an ellipse at 50% 100% sized 90%×93% of the band, blue at the
				// center fading to midnight by the top, with a 40% interpolation hint
				// bending the falloff to Figma's ease-in curve (RMSE ~5.6/channel,
				// bottom-center 36,70,137 vs Figma 37,71,138). % sizing keeps it
				// correct across viewport widths. Colors are tokens: blue = #26498f
				// (--goodparty-blue-bright), field = --midnight-900 (colors.css).
				band: 'bg-[radial-gradient(90%_93%_at_50%_100%,var(--goodparty-blue-bright)_0%,40%,var(--midnight-900)_100%)]',
				heading: 'text-white',
				office: 'text-white',
				attribution: 'text-white',
				tag: 'border-gray-300 text-[color:#0a0a0a]',
				attributionMuted: 'text-gray-400',
			},
			cream: {
				base: 'text-midnight-900',
				band: 'bg-goodparty-cream',
				heading: 'text-midnight-900',
				office: 'text-midnight-900',
				attribution: 'text-midnight-900',
				tag: 'bg-white border-gray-300 text-[color:#0a0a0a]',
				attributionMuted: 'text-gray-500',
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
	/**
	 * Second office line, stacked directly under the first with no gap. Used by
	 * the simultaneous candidate + office-holder frame (Figma state C), which
	 * shows the seat held above "Candidate for [position]".
	 */
	secondaryOffice?: string;
	/** When set, the secondary office line renders as a link. */
	secondaryOfficeHref?: string;
	profileImage?: SanityImage;
	profileImageUrl?: string;
	isEmpowered?: boolean;
	/** Persona tag pills rendered above the name (e.g. "Candidate", "Incumbent"). Renders nothing when empty. */
	tags?: string[];
	/**
	 * Attribution row under the office line. When omitted it falls back to
	 * `isEmpowered` (empowered → "Empowered by GoodParty.org", otherwise none).
	 */
	attribution?: AttributionMode;
	/**
	 * GoodParty.org mark — the logo on the portrait and the one beside the
	 * attribution line. Separate from `attribution` because the mark says the
	 * profile is a GoodParty.org one while the line states a fact about the
	 * person; on /people those are different inputs (claim vs pledge) and tying
	 * the mark to the pledge would strip the branding from every claimed
	 * officeholder, who cannot carry the flag at all. Defaults to the empowerment
	 * framing, which is what the /candidate pages mean by it.
	 */
	showBrandMark?: boolean;
};

/**
 * Which lines get the Figma 20/28 semibold treatment (with the mark) rather than
 * the grey disclaimer line. Polarity, not source: a line that says the person
 * did something with us reads as an affirmation, and one that says they did not
 * is a footnote — putting "Has Not Taken the GoodParty.org Pledge" in the
 * affirmative style beside the logo would read as a badge.
 */
const AFFIRMATIVE_ATTRIBUTIONS: ReadonlySet<AttributionMode> = new Set<AttributionMode>(['empowered', 'pledged']);

export function ProfileHero(props: ProfileHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const resolvedBackgroundColor = backgroundColor === 'white' ? 'cream' : backgroundColor;
	const { base, backgroundWrapper, band, belowBand, container, imageWrapper, image, badge, content, tagRow, tag, tagText, nameOffice, officeLines, heading, office, officeLink, attribution, attributionIcon, attributionText, attributionMuted } = styles({ backgroundColor: resolvedBackgroundColor });

	const renderOfficeLine = (label: string, href?: string) => (
		<Text key={label} as="p" styleType="subtitle-1" className={office()}>
			{href ? (
				<Anchor href={href} className={officeLink()}>
					{label}
				</Anchor>
			) : (
				label
			)}
		</Text>
	);

	// `attribution` wins when provided; otherwise fall back to legacy `isEmpowered`.
	const attributionMode: AttributionMode = props.attribution ?? (props.isEmpowered ? 'empowered' : 'none');
	const showBrandMark = props.showBrandMark ?? attributionMode === 'empowered';
	const isAffirmative = AFFIRMATIVE_ATTRIBUTIONS.has(attributionMode);
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
						{showBrandMark && <Logo className={badge()} />}
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
							<div className={officeLines()}>
								{renderOfficeLine(props.office, props.officeHref)}
								{props.secondaryOffice && renderOfficeLine(props.secondaryOffice, props.secondaryOfficeHref)}
							</div>
						</div>
						{attributionMode !== 'none' &&
							(isAffirmative ? (
								<div className={attribution()}>
									{showBrandMark && <Logo className={attributionIcon()} />}
									<span className={attributionText()}>{ATTRIBUTION_COPY[attributionMode]}</span>
								</div>
							) : (
								<Text as="span" styleType="body-2" className={attributionMuted()}>
									{ATTRIBUTION_COPY[attributionMode]}
								</Text>
							))}
					</div>
				</div>
			</Container>
		</section>
	);
}
