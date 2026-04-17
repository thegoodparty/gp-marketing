import { PortableText } from '@portabletext/react';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import type { ArticleQueryResult } from 'sanity.types';
import { ImageCTAGroup } from '~/RichTextContentSections/ImageCTAGroup';
import { CTASectionGroup } from '~/RichTextContentSections/CTASectionGroup';
import { TableSectionGroup } from '~/RichTextContentSections/TableSectionGroup';
import { ImageContentSectionGroup } from '~/RichTextContentSections/ImageContentSectionGroup';
import { InlineQuoteSectionGroup } from '~/RichTextContentSections/InlineQuoteSectionGroup';
import { ButtonSectionGroup } from '~/RichTextContentSections/ButtonSectionGroup';
import { FAQsSectionGroup } from '~/RichTextContentSections/FAQsSectionGroup';
import { block, marks, list, listItem } from '~/ui/RichData';
import { CalloutSectionGroup } from '~/RichTextContentSections/CalloutSectionGroup';
import { Typography } from '~/ui/Typography';
import { TYPOGRAPHY_STACK_SPACING, type TypographyStackSpacing } from '~/types/ui';

export type ArticleSections = NonNullable<
	NonNullable<NonNullable<NonNullable<ArticleQueryResult>['contentSections']>['block_editorialContentSections']>[number]
>;

interface Props {
	contentSections?: ArticleSections[] | null;
	stackSpacing?: TypographyStackSpacing;
}

export function RichTextContentSections(props: Props) {
	if (!props.contentSections || props.contentSections.length === 0) {
		return null;
	}

	const stackSpacing = props.stackSpacing ?? TYPOGRAPHY_STACK_SPACING.DEFAULT;
	const isEditorial = stackSpacing === TYPOGRAPHY_STACK_SPACING.EDITORIAL;

	return (
		<Typography as='article' data-section='RichTextContentSection' stackSpacing={stackSpacing}>
			<PortableText
				value={props.contentSections}
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
									<iframe
										width='560'
										height='315'
										src='https://www.youtube.com/embed/k5CyDlFUE-k?si=7xXhw9-t3Bnv9P4C'
										title='YouTube video player'
										frameBorder={0}
										allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
										referrerPolicy='strict-origin-when-cross-origin'
										allowFullScreen
									></iframe>
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
