import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';

import { normalizeRawCtaToButton, transformButton, transformButtons, type RawCtaInput } from '~/lib/buttonTransformer';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveRichTextTokens, resolveSectionText } from '~/lib/resolveSectionText';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

import { IllustratedColumnsBlock, type IllustratedColumnProps } from '~/ui/IllustratedColumnsBlock';
import { RichData } from '~/ui/RichData';

type Section = Extract<Sections, { _type: 'component_illustratedColumnsBlock' }>;

type Props = Section & {
	tokens?: TokenMap;
};

type RawColumn = NonNullable<Section['list_illustratedColumns']>[number];

type ColumnLayout = NonNullable<Section['illustratedColumnsBlockDesignSettings']>['field_columnLayout234Columns'];

/**
 * The Studio dropdown reads "2 Columns" and so on. A document saved without the
 * field renders three, which is what the design draws.
 */
export function resolveIllustratedColumns(layout: ColumnLayout | undefined): '2' | '3' | '4' {
	const cleaned = layout ? stegaClean(layout) : undefined;
	return cleaned === '2Col' ? '2' : cleaned === '4Col' ? '4' : '3';
}

function buildColumn(column: RawColumn, tokens?: TokenMap): IllustratedColumnProps {
	const raw = column.button;
	const normalized = raw ? normalizeRawCtaToButton(raw as RawCtaInput, `${column._key ?? 'column'}-link`) : undefined;
	const link = normalized ? transformButton(normalized) : undefined;
	const label = link && typeof link.label === 'string' ? resolveSectionText(link.label, tokens) : link?.label;
	const description = resolveSectionText(column.field_description, tokens);

	return {
		key: column._key,
		image: column.img_image ?? undefined,
		imageAlt: column.img_image?.alt ?? undefined,
		title: resolveSectionText(column.field_title, tokens),
		description: description ? <p>{description}</p> : undefined,
		link: link ? { ...link, label } : undefined,
	};
}

export function IllustratedColumnsBlockSection(props: Props) {
	const { tokens, ...section } = props;
	const settings = section.illustratedColumnsBlockDesignSettings;

	const backgroundColor = settings?.field_blockColorCreamMidnight ? resolveBg(stegaClean(settings.field_blockColorCreamMidnight)) : 'cream';

	const items = (section.list_illustratedColumns ?? [])
		.map(column => buildColumn(column, tokens))
		.filter(item => Boolean(item.title) || Boolean(item.image) || item.description !== undefined);

	// No columns means no block at all, not an empty anchor: the same rule as the other election blocks.
	if (items.length === 0) return null;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Illustrated Columns Block'>
			<IllustratedColumnsBlock
				backgroundColor={backgroundColor === 'midnight' ? 'midnight' : 'cream'}
				columns={resolveIllustratedColumns(settings?.field_columnLayout234Columns)}
				header={{
					title: resolveSectionText(section.summaryInfo?.field_title, tokens),
					label: resolveSectionText(section.summaryInfo?.field_label, tokens),
					caption: resolveSectionText(section.summaryInfo?.field_caption, tokens),
					copy: <RichData value={resolveRichTextTokens(section.summaryInfo?.block_summaryText, tokens)} />,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				items={items}
			/>
		</section>
	);
}
