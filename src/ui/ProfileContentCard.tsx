import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { Text, type StyleTypes } from './Text.tsx';
import { isValidRichText } from './_lib/isValidRichText.ts';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 border-b border-gray-200 last:border-b-0 pb-[16px]',
		heading: '',
		content: 'min-w-0 break-words',
	},
	variants: {
		// `bare` drops the inter-section divider + bottom padding used in the
		// joined (single-card) layout. In the Figma people-profile "separated"
		// layout each section is a padded sub-box inside its own white card, so
		// sections are set apart by whitespace, not a hairline rule.
		bare: {
			true: { base: 'flex flex-col gap-6 p-6' },
		},
	},
});

const HEADING_STYLE_TYPE = {
	section: 'section-heading',
	sub: 'section-subheading',
	legacy: 'subtitle-1',
} as const satisfies Record<string, StyleTypes>;

export type ProfileContentCardProps = {
	className?: string;
	cardType?: 'about-me' | 'why-running' | 'top-issues';
	/**
	 * Groups adjacent cards into one white container in the "separated" layout
	 * (Figma people profiles): cards sharing a `group` render inside a single
	 * rounded white card, with cream gaps between groups. Ignored by the joined
	 * layout (`/candidate`).
	 */
	group?: string;
	heading?: string;
	/**
	 * Heading level within a white card, per the Figma people-profile frames:
	 * the card's first section is `section` (32/44) and any section stacked
	 * under it is `sub` (24/32), e.g. "Campaign Issues" beneath "Why I'm
	 * Running for Office". Supplied by ProfileContentBlock's separated layout
	 * from the card's position in its group. Left undefined by the joined
	 * `/candidate` layout, which keeps its own uniform subtitle heading.
	 */
	headingStyle?: 'section' | 'sub';
	content?: ReactNode;
	/**
	 * Render `content` verbatim, without the card chrome (bottom divider + the
	 * `<Text>` body wrapper). Used for self-styled embedded blocks like the
	 * claim prompt or the structured "About [position]" card.
	 */
	raw?: boolean;
	/** Drops the inter-section divider (used by the grouped/separated layout). */
	bare?: boolean;
};

export function ProfileContentCard(props: ProfileContentCardProps) {
	const { base, heading, content } = styles({ bare: props.bare });

	if (props.raw) {
		return <>{props.content}</>;
	}

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentCard'>
			{props.heading && (
				<Text
					as={props.headingStyle === 'sub' ? 'h3' : 'h2'}
					styleType={HEADING_STYLE_TYPE[props.headingStyle ?? 'legacy']}
					className={heading()}
				>
					{props.heading}
				</Text>
			)}
			{isValidRichText(props.content) && (
				<div className={cn(content(), typeof props.content === 'string' && 'whitespace-pre-line')}>
					<Text styleType='body-2'>{props.content}</Text>
				</div>
			)}
		</article>
	);
}
