import { PortableText } from '@portabletext/react';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import type { ArticleQueryResult, Block_policyText } from 'sanity.types';
import { ImageCTAGroup } from '~/RichTextContentSections/ImageCTAGroup';
import { CTASectionGroup } from '~/RichTextContentSections/CTASectionGroup';
import { TableSectionGroup } from '~/RichTextContentSections/TableSectionGroup';
import { ImageContentSectionGroup } from '~/RichTextContentSections/ImageContentSectionGroup';
import { InlineQuoteSectionGroup } from '~/RichTextContentSections/InlineQuoteSectionGroup';
import { ButtonSectionGroup } from '~/RichTextContentSections/ButtonSectionGroup';
import { FAQsSectionGroup } from '~/RichTextContentSections/FAQsSectionGroup';
import { block, marks, list, listItem } from '~/ui/RichData';
import { CalloutSectionGroup } from '~/RichTextContentSections/CalloutSectionGroup';
import { VideoSectionGroup } from '~/RichTextContentSections/VideoSectionGroup';
import { Typography } from '~/ui/Typography';
import { TypographyStackSpacing } from '~/types/ui';

export type ArticleSections = NonNullable<
	NonNullable<NonNullable<NonNullable<ArticleQueryResult>['contentSections']>['block_editorialContentSections']>[number]
>;
type RichTextSection = ArticleSections | Block_policyText[number];

interface Props {
	contentSections?: ArticleSections[] | Block_policyText | null;
	stackSpacing?: TypographyStackSpacing;
}

export function RichTextContentSections(props: Props) {
	if (!props.contentSections || props.contentSections.length === 0) {
		return null;
	}

	const stackSpacing = props.stackSpacing ?? TypographyStackSpacing.DEFAULT;
	const isEditorial = stackSpacing === TypographyStackSpacing.EDITORIAL;
	const contentSections: RichTextSection[] = props.contentSections;

	return (
		<Typography as='article' data-section='RichTextContentSection' stackSpacing={stackSpacing}>
			<PortableText<RichTextSection>
				value={contentSections}
				components={{
					types: {
						imageCta({ value: section }) {
							return (
								<ComponentErrorBoundary key={`image-cta-${section._key}`} componentName='ImageCTAGroup'>
									<ImageCTAGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						ctaSection({ value: section }) {
							return (
								<ComponentErrorBoundary key={`cta-section-${section._key}`} componentName='CTASectionGroup'>
									<CTASectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						videoSection({ value: section }) {
							return (
								<ComponentErrorBoundary key={`video-section-${section._key}`} componentName='VideoSectionGroup'>
									<VideoSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						tableGroup({ value: section }) {
							return (
								<ComponentErrorBoundary key={`table-section-${section._key}`} componentName='TableSectionGroup'>
									<TableSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						imageContentSection({ value: section }) {
							return (
								<ComponentErrorBoundary key={`image-content-section-${section._key}`} componentName='ImageContentSectionGroup'>
									<ImageContentSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						inlineQuoteSection({ value: section }) {
							return (
								<ComponentErrorBoundary key={`inline-quote-section-${section._key}`} componentName='InlineQuoteSectionGroup'>
									<InlineQuoteSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						button({ value: section }) {
							return (
								<ComponentErrorBoundary key={`button-section-${section._key}`} componentName='ButtonSectionGroup'>
									<ButtonSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						faqs({ value: section }) {
							return (
								<ComponentErrorBoundary key={`faqs-section-${section._key}`} componentName='FAQsSectionGroup'>
									<FAQsSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
						callout({ value: section }) {
							return (
								<ComponentErrorBoundary key={`callout-section-${section._key}`} componentName='CalloutSectionGroup'>
									<CalloutSectionGroup {...section} />
								</ComponentErrorBoundary>
							);
						},
					},
					marks: marks(),
					block: block({ isInline: false }),
					list: list(),
					listItem: listItem(),
					hardBreak: () => (isEditorial ? <br /> : false),
				}}
			/>
		</Typography>
	);
}
