import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { FeaturedBlogBlock } from '~/ui/FeaturedBlogBlock';
import type { SanityImage } from '~/ui/types';

export function FeaturedBlogBlockSection(section: Extract<Sections, { _type: 'component_featuredBlogBlock' }>) {
	return (
		section.featuredBlogBlockContent?.ref_chooseArticle?.editorialOverview?.field_editorialTitle && (
			<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Featured Blog Block'>
				<FeaturedBlogBlock
					title={section.featuredBlogBlockContent?.ref_chooseArticle?.editorialOverview?.field_editorialTitle}
					image={section.featuredBlogBlockContent?.ref_chooseArticle?.editorialAssets?.img_featuredImage as unknown as SanityImage}
					buttons={[
						{
							label: 'Read More',

							href: section.featuredBlogBlockContent?.ref_chooseArticle.href,
							buttonType: 'internal',
						},
					]}
					label='Featured Article'
				/>
			</section>
		)
	);
}
