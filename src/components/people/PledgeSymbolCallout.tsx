import { ATTRIBUTION_PLEDGE_PHRASE, PLEDGE_CALLOUT_LINK_LABEL, PLEDGE_SYMBOL_CALLOUT } from '~/ui/_lib/attributionCopy';
import { tv } from '~/ui/_lib/utils';
import { IconResolver } from '~/ui/IconResolver';
import { PledgeModal } from '~/ui/PledgeModal';
import { Logo } from '~/sanity/utils/Logo';

const styles = tv({
	slots: {
		// Figma: midnight/50 fill, midnight/200 hairline, 12px radius. On the phone
		// the mark sits above the text inside 16px padding; from md it gets its own
		// 104px column with a hairline between it and the text.
		base: 'flex flex-col gap-3 rounded-md border border-midnight-200 bg-midnight-50 p-4 text-black md:flex-row md:items-stretch md:gap-0 md:p-0',
		mark: 'flex shrink-0 items-start md:w-[6.5rem] md:items-center md:justify-center md:border-r md:border-midnight-200',
		// Figma: 56x48 glyph on the phone, 64x52 on desktop.
		markIcon: 'h-12 w-14 md:h-[3.25rem] md:w-16',
		body: 'flex min-w-0 flex-col gap-1 md:px-6 md:py-4',
		// Figma: Outfit 20/28 bold on the phone, 18/28 semibold on desktop.
		heading: 'font-primary text-[1.25rem]/[1.75rem] font-bold md:text-[1.125rem]/[1.75rem] md:font-semibold',
		// Figma: Open Sans 16/24 on the phone, 14/20 on desktop; no ramping token lands on both.
		sentence: 'font-secondary text-[1rem]/[1.5rem] md:text-[0.875rem]/[1.25rem]',
		phrase: 'font-bold',
		// The pop-up trigger reads as a link after the sentence (info blue, underlined,
		// arrow), separated by a word space so it wraps flush. It is a button because
		// it opens a dialog rather than navigating.
		link: 'inline-flex items-center gap-1 whitespace-nowrap align-baseline font-semibold text-info-500 underline underline-offset-4 hover:no-underline',
	},
});

/**
 * Explains the heart-and-star mark above a profile's Other Candidates list, with
 * the "Read the full pledge" pop-up the hero and the featured candidates use.
 */
export function PledgeSymbolCallout() {
	const { base, mark, markIcon, body, heading, sentence, phrase, link } = styles();
	const copy = PLEDGE_SYMBOL_CALLOUT.sentence;
	const at = copy.indexOf(ATTRIBUTION_PLEDGE_PHRASE);

	return (
		<div className={base()} data-component='PledgeSymbolCallout'>
			<div className={mark()}>
				<Logo className={markIcon()} aria-hidden='true' />
			</div>
			<div className={body()}>
				<p className={heading()}>{PLEDGE_SYMBOL_CALLOUT.heading}</p>
				<p className={sentence()}>
					{copy.slice(0, at)}
					<span className={phrase()}>{ATTRIBUTION_PLEDGE_PHRASE}</span>
					{copy.slice(at + ATTRIBUTION_PLEDGE_PHRASE.length)}{' '}
					<PledgeModal>
						<button type='button' className={link()}>
							{PLEDGE_CALLOUT_LINK_LABEL}
							<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
						</button>
					</PledgeModal>
				</p>
			</div>
		</div>
	);
}
