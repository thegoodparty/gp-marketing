import Image from 'next/image';
import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { IconResolver } from './IconResolver.tsx';
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
		// how much height the photo contributes to the flow (md 288-184=104, lg 320-200=120)
		// so the hero box ends at the band, while the photo still renders past it. The
		// sidebar column in ProfileContentBlock offsets by the same amount to clear it.
		imageWrapper: 'relative z-20 flex-shrink-0 md:-mb-[104px] lg:-mb-[120px]',
		// Circular portrait straddling the dark band and the cream content below.
		image: 'relative rounded-full overflow-hidden w-40 h-40 md:w-72 md:h-72 lg:w-80 lg:h-80',
		badge: 'absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 drop-shadow-md',
		content: 'flex flex-col gap-4 text-left z-10 md:pt-2',
		tagRow: 'flex flex-wrap items-center gap-2',
		tag: 'inline-flex w-fit items-center rounded-full px-3 py-1',
		// Pledge pill sits in the SAME row as the persona tags so it costs no vertical
		// height. It previously rendered as its own full-width band under the hero,
		// which is dead space the design does not have (and it collided with the
		// straddling portrait once the hero stopped reserving the photo's full height).
		pledgeTag: 'inline-flex w-fit items-center gap-1.5 rounded-full bg-halo-green-100 px-3 py-1 text-midnight-900',
		nameOffice: 'flex flex-col gap-2',
		heading: '',
		office: '',
		attribution: 'flex items-center justify-start gap-1.5',
		attributionIcon: 'w-[37px] h-[28px]',
		attributionText: 'text-sm',
		notEndorsed: 'text-sm',
	},
	variants: {
		backgroundColor: {
			midnight: {
				band: 'bg-midnight-900',
				heading: 'text-white',
				office: 'text-white',
				attributionText: 'text-white',
				tag: 'bg-goodparty-cream text-midnight-900',
				notEndorsed: 'text-gray-400',
			},
			cream: {
				base: 'text-midnight-900',
				band: 'bg-goodparty-cream',
				heading: 'text-midnight-900',
				office: 'text-midnight-900',
				attributionText: 'text-midnight-900',
				tag: 'bg-white text-midnight-900 ring-1 ring-midnight-900/10',
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
	profileImage?: SanityImage;
	profileImageUrl?: string;
	isEmpowered?: boolean;
	/** Renders a "Took the GoodParty.org Pledge" pill alongside the persona tags. */
	pledged?: boolean;
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
	const { base, backgroundWrapper, band, belowBand, container, imageWrapper, image, badge, content, tagRow, tag, pledgeTag, nameOffice, heading, office, attribution, attributionIcon, attributionText, notEndorsed } = styles({ backgroundColor: resolvedBackgroundColor });

	// `attribution` wins when provided; otherwise fall back to legacy `isEmpowered`.
	const attributionMode = props.attribution ?? (props.isEmpowered ? 'empowered' : 'none');
	const tags = props.tags?.filter(Boolean) ?? [];

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
						{props.isEmpowered && (
							<Logo width={80} height={65} className={badge()} />
						)}
					</div>
					<div className={content()}>
						{(tags.length > 0 || props.pledged) && (
							<div className={tagRow()}>
								{tags.map((label) => (
									<Text key={label} as="span" styleType="caption" className={tag()}>
										{label}
									</Text>
								))}
								{props.pledged && (
									<span className={pledgeTag()}>
										<IconResolver icon="badge-check" className="h-3.5 w-3.5" />
										<Text as="span" styleType="caption">
											Took the GoodParty.org Pledge
										</Text>
									</span>
								)}
							</div>
						)}
						<div className={nameOffice()}>
							<Text as="h1" styleType={props.candidateName.length > 28 ? 'heading-md' : 'heading-lg'} className={heading()}>
								{props.candidateName}
							</Text>
							<Text as="p" styleType="subtitle-1" className={office()}>
								{props.office}
							</Text>
						</div>
						{attributionMode === 'empowered' && (
							<div className={attribution()}>
								<Logo className={attributionIcon()} />
								<Text as="span" styleType="body-2" className={attributionText()}>
									Empowered by GoodParty.org
								</Text>
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
