import { transformButtons } from '~/lib/buttonTransformer';
import type { Sections } from '~/PageSections';
import { BlogBlock } from '~/ui/BlogBlock';
import { RichData } from '~/ui/RichData';
import { resolveBlogCard } from '~/ui/_lib/resolveBlogCard';
import { stegaClean } from 'next-sanity';

export function BlogBlockSection(section: Extract<Sections, { _type: 'component_blogBlock' }>) {
	if (!section.items) return null;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Blog Block'>
			<BlogBlock
				header={{
					title: section.blogBlockSummaryInfo?.field_title,
					label: section.blogBlockSummaryInfo?.field_label,
					copy: <RichData value={section.blogBlockSummaryInfo?.block_summaryText} />,
					buttons: transformButtons(
						[
							section.loadMoreHref && section.itemsCount > section.items.length
								? {
										_key: 'view-all',
										action: 'Internal',
										hierarchy: 'Secondary',
										link: {
											_id: '38975309',
											_type:
												section.blogBlockContent?.field_blogBlockContentOptions === 'AllLatest'
													? 'goodpartyOrg_allArticles'
													: section.blogBlockContent?.field_blogBlockContentOptions === 'Category'
														? 'categories'
														: 'topics',
											name: null,
											label: null,
											title: 'View all',
											href: section.loadMoreHref,
										},
										text: 'View all',
										field_externalLink: null,
										ref_download: null,
										anchor: null,
									}
								: undefined,
							...(section.blogBlockSummaryInfo?.list_buttons ?? []),
						].filter(Boolean),
					),
				}}
				items={section.items.map(resolveBlogCard).filter(Boolean)}
			/>
		</section>
	);
}
