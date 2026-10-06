import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';

import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText, resolveRichTextTokens } from '~/lib/resolveSectionText';

import { resolveBg } from '~/ui/_lib/resolveBg';

import { LocationEditorialBlock } from '~/ui/LocationEditorialBlock';
import { RichData } from '~/ui/RichData';

type Props = Extract<Sections, { _type: 'component_locationEditorialBlock' }> & {
	editorialOverride?: SectionOverrides['component_locationEditorialBlock'];
	tokens?: TokenMap;
};

export function LocationEditorialBlockSection(props: Props) {
	const { editorialOverride, tokens, ...section } = props;

	if (editorialOverride?.hidden) {
		return null;
	}

	const backgroundColor = section.locationEditorialBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationEditorialBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	// The per-location paragraphs win over the Sanity field. The field only
	// covers pages whose route supplies nothing (see the block's schema note):
	// on the location templates one block instance serves every page in the
	// family, so authored copy there would repeat across thousands of pages.
	const paragraphs = (editorialOverride?.paragraphs ?? []).filter(paragraph => paragraph.trim().length > 0);
	const authored = resolveRichTextTokens(section.locationEditorialBlockContent?.block_summaryText, tokens);

	// Nothing from either source renders nothing at all, rather than an empty card.
	const copy = paragraphs.length
		? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
		: Array.isArray(authored) && authored.length > 0
			? <RichData value={authored} />
			: undefined;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Editorial Block'>
			<LocationEditorialBlock
				backgroundColor={backgroundColor}
				heading={editorialOverride?.heading ?? resolveSectionText(section.locationEditorialBlockHeader?.field_title, tokens)}
				copy={copy}
			/>
		</section>
	);
}
