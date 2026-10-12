import Image from 'next/image';
import { cn, tv } from './_lib/utils.ts';
import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { IconResolver } from './IconResolver.tsx';
import { PledgeModal } from './PledgeModal.tsx';
import { Text } from './Text.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import type { SanityImage } from './types.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import {
	ATTRIBUTION_COPY,
	ATTRIBUTION_PLEDGE_PHRASE,
	PLEDGE_CALLOUT_LINK_LABEL,
	pledgeCalloutCopy,
	type AttributionMode,
	type PledgeCalloutMode,
	type PledgeSubject,
} from './_lib/attributionCopy.ts';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		// On desktop the portrait STRADDLES the dark band: it overflows the hero box
		// so the following content well can start 48px below the band (as the Figma
		// frames do) instead of below the full photo. overflow-visible lets it show;
		// z-10 keeps it painted above the next section's cream background (later
		// sibling in the DOM). Mobile keeps overflow-hidden — the band bleeds past
		// the container there and nothing overflows.
		base: 'relative overflow-hidden text-white md:overflow-visible md:z-10',
		// Extra bleed on mobile so the band reaches the viewport edges.
		backgroundWrapper: 'absolute inset-0 max-md:-left-[var(--container-padding)] max-md:-right-[var(--container-padding)]',
		// The band is the whole hero box. Its height follows the text column (name,
		// office, intro, pledge callout), so a long office line or a wrapped intro
		// makes the band taller instead of spilling white text onto the cream below.
		band: 'absolute inset-0',
		// Figma: 24px top and bottom on the phone; 36px top on desktop, with the
		// bottom padding carried by the text column so the portrait can hang below.
		container: 'relative z-10 flex flex-col items-start gap-6 pt-6 pb-6 md:flex-row md:items-start md:gap-12 lg:gap-16 md:pt-9 md:pb-0',
		// The negative bottom margin is the portrait's OVERFLOW below the hero. It is
		// anchored to the BOTTOM of the row (self-end) so the overflow is the same
		// however tall the text column is: md 48px, lg 68px (Figma: the 416px
		// portrait ends 68px under the 396px band). The sidebar column in
		// ProfileContentBlock offsets by the same amount to clear it.
		imageWrapper: 'relative z-20 flex-shrink-0 md:self-end md:-mb-12 lg:-mb-[68px]',
		// Circular portrait straddling the dark band and the cream content below.
		image: 'relative rounded-full overflow-hidden w-40 h-40 md:w-72 md:h-72 lg:w-[416px] lg:h-[416px]',
		// GoodParty logo overlaid on the photo's bottom-right corner. Sized as a
		// fraction of the portrait per Figma (desktop glyph 113x94 on the 416px
		// avatar; mobile 48x40 on the 144px avatar), so it scales across breakpoints.
		badge: 'absolute bottom-1 right-1 z-30 drop-shadow-md w-12 h-10 md:w-20 md:h-[66px] lg:w-[113px] lg:h-[94px]',
		// Figma: 24px between the name group, the intro and the callout; 32px of
		// band below the callout on desktop.
		content: 'flex min-w-0 w-full flex-col gap-6 text-left z-10 md:pb-8',
		headingGroup: 'flex flex-col gap-2',
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
		// Figma intro: Open Sans 16/24 on the phone, 18/24 on desktop. body-2 ramps
		// 16 → 17 → 18 (from 1280), which lands on both frame sizes without a fixed
		// override; the line-height is the token's. Color via variant.
		intro: '',
		// The pledge callout: an 8px-radius box with a hairline border and a faint
		// fill over the band (Figma: midnight/200 line, midnight/50 at 10%). On the
		// phone the mark sits above the sentence; from md they share a row with the
		// mark centred on the text block, as the frame draws it.
		callout: 'flex w-full flex-col gap-1 rounded-sm border p-4 md:flex-row md:items-center md:gap-4',
		// Figma: 48x40 glyph on the phone, 49x42 on desktop.
		calloutIcon: 'h-10 w-12 shrink-0 md:h-[2.625rem] md:w-[3.0625rem]',
		// Figma: Open Sans 16/24 on both frames, which no ramping token gives.
		calloutText: 'font-secondary text-[1rem]/[1.5rem]',
		calloutPhrase: 'font-semibold',
		// The pop-up trigger reads as a link at the end of the sentence (underlined,
		// semibold, arrow), separated from it by an ordinary word space so it sits
		// flush when it wraps to a new line. It is a button because it opens a
		// dialog, not a page; nowrap keeps the label and its arrow together.
		calloutLink: 'inline-flex items-center gap-1 whitespace-nowrap align-baseline font-semibold underline underline-offset-4 hover:no-underline',
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
				intro: 'text-white',
				callout: 'border-midnight-200 bg-midnight-50/10 text-white',
				attribution: 'text-white',
				tag: 'border-gray-300 text-[color:#0a0a0a]',
				attributionMuted: 'text-gray-400',
			},
			cream: {
				base: 'text-midnight-900',
				band: 'bg-goodparty-cream',
				heading: 'text-midnight-900',
				office: 'text-midnight-900',
				intro: 'text-midnight-900',
				callout: 'border-midnight-200 bg-white text-midnight-900',
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
	/**
	 * The paragraph under the office line (Voter Guide frames). Tokens are
	 * already resolved by the caller; nothing here means no paragraph, which is
	 * what the legacy /candidate pages render.
	 */
	intro?: string;
	profileImage?: SanityImage;
	profileImageUrl?: string;
	isEmpowered?: boolean;
	/** Persona tag pills rendered above the name (e.g. "Candidate", "Incumbent"). Renders nothing when empty. */
	tags?: string[];
	/**
	 * What the hero says about the person's relationship to GoodParty.org. The
	 * three pledge values render the pledge CALLOUT (box, sentence, "Read the full
	 * pledge" pop-up link); `empowered` renders the legacy /candidate line; `none`
	 * renders nothing. When omitted it falls back to `isEmpowered`.
	 */
	attribution?: AttributionMode;
	/**
	 * Who the callout sentence is about: "This candidate…" or "This elected
	 * official…". Defaults to candidate, which is what the frames draw.
	 */
	pledgeSubject?: PledgeSubject;
	/**
	 * GoodParty.org mark — the logo on the portrait and the one beside the
	 * legacy attribution line. Separate from `attribution` because the mark says
	 * the profile is a GoodParty.org one while the line states a fact about the
	 * person; on /people those are different inputs (claim vs pledge) and tying
	 * the mark to the pledge would strip the branding from every claimed
	 * officeholder, who cannot carry the flag at all. Defaults to the empowerment
	 * framing, which is what the /candidate pages mean by it.
	 *
	 * The mark INSIDE the pledge callout is not this: it follows the pledge
	 * itself, because there it illustrates the sentence beside it.
	 */
	showBrandMark?: boolean;
};

const PLEDGE_CALLOUT_MODES: ReadonlySet<AttributionMode> = new Set<AttributionMode>(['pledged', 'notPledged', 'pledgeIneligible']);

const isPledgeCalloutMode = (mode: AttributionMode): mode is PledgeCalloutMode => PLEDGE_CALLOUT_MODES.has(mode);

export function ProfileHero(props: ProfileHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const resolvedBackgroundColor = backgroundColor === 'white' ? 'cream' : backgroundColor;
	const {
		base,
		backgroundWrapper,
		band,
		container,
		imageWrapper,
		image,
		badge,
		content,
		headingGroup,
		tagRow,
		tag,
		tagText,
		nameOffice,
		officeLines,
		heading,
		office,
		officeLink,
		intro,
		callout,
		calloutIcon,
		calloutText,
		calloutPhrase,
		calloutLink,
		attribution,
		attributionIcon,
		attributionText,
	} = styles({ backgroundColor: resolvedBackgroundColor });

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

	// Only the pledge's name is set in bold, not the sentence around it: the
	// sentence states something about this person, and the bold marks the thing
	// being referred to.
	const renderCalloutSentence = (mode: PledgeCalloutMode) => {
		const copy = pledgeCalloutCopy(mode, props.pledgeSubject ?? 'candidate');
		const at = copy.indexOf(ATTRIBUTION_PLEDGE_PHRASE);
		if (at < 0) return copy;

		return (
			<>
				{copy.slice(0, at)}
				<span className={calloutPhrase()}>{ATTRIBUTION_PLEDGE_PHRASE}</span>
				{copy.slice(at + ATTRIBUTION_PLEDGE_PHRASE.length)}
			</>
		);
	};

	// `attribution` wins when provided; otherwise fall back to legacy `isEmpowered`.
	const attributionMode: AttributionMode = props.attribution ?? (props.isEmpowered ? 'empowered' : 'none');
	const showBrandMark = props.showBrandMark ?? attributionMode === 'empowered';
	const tags = props.tags?.filter(Boolean) ?? [];

	// Per Figma the persona pill is colour-coded by label: an in-office "Incumbent"
	// reads halo-green, everyone else (Candidate / Former Official) reads bright-yellow.
	const tagFill = (label: string): string => (label === 'Incumbent' ? 'bg-halo-green-50' : 'bg-bright-yellow-50');

	return (
		<section className={cn(base(), props.className)} data-component="ProfileHero">
			<div className={backgroundWrapper()}>
				<div className={band()} />
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
						<div className={headingGroup()}>
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
							{attributionMode === 'empowered' && (
								<div className={attribution()}>
									{showBrandMark && <Logo className={attributionIcon()} />}
									<span className={attributionText()}>{ATTRIBUTION_COPY.empowered}</span>
								</div>
							)}
						</div>
						{props.intro && (
							<Text as="p" styleType="body-2" className={intro()}>
								{props.intro}
							</Text>
						)}
						{isPledgeCalloutMode(attributionMode) && (
							<div className={callout()} data-component="ProfileHeroPledgeCallout">
								{attributionMode === 'pledged' && <Logo className={calloutIcon()} aria-hidden="true" />}
								<p className={calloutText()}>
									{renderCalloutSentence(attributionMode)}{' '}
									<PledgeModal source="profile_hero">
										<button type="button" className={calloutLink()}>
											{PLEDGE_CALLOUT_LINK_LABEL}
											<IconResolver icon="arrow-up-right" className="min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4" />
										</button>
									</PledgeModal>
								</p>
							</div>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}
