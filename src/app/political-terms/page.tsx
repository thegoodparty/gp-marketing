import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { goodpartyOrg_glossaryQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { GlossaryList } from '~/ui/GlossaryList';
import { RichData } from '~/ui/RichData';
import { getCashedTerms } from '~/lib/getCashedTerms';
import { searchTermsToABCD } from '~/lib/serchTermsToABCD';
import { GlossaryHero } from '~/ui/GlossaryHero';
import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { toPlainText } from '@portabletext/react';

export default async function Page() {
	const page = await sanityFetch({
		query: goodpartyOrg_glossaryQuery,
	});

	if (!page) {
		notFound();
	}

	const searchTerms = (await getCashedTerms()).terms;

	return (
		<>
			<GlossaryHero
				title={page.glossaryOverview?.field_name ?? 'Terms Glossary'}
				copy={page.glossaryOverview?.field_pageSubtitle}
				navigation={searchTermsToABCD(searchTerms)}
				searchTerms={searchTerms}
			/>
			<GlossaryList
				items={page.aTerms
					?.map(term => {
						const copy = term.glossaryTermOverview?.block_glossaryTermDefinition
							? toPlainText(term.glossaryTermOverview?.block_glossaryTermDefinition as any)
							: undefined;
						return term.glossaryTermOverview?.field_glossaryTerm && term.href
							? {
									title: term.glossaryTermOverview?.field_glossaryTerm,
									copy: copy && copy.length > 300 ? copy.slice(0, 300) + '...' : copy,
									href: term.href,
								}
							: undefined;
					})
					.filter(Boolean)}
			/>
			{page.glossaryPageCta && 'overview' in page.glossaryPageCta && page.glossaryPageCta.overview?.field_title && (
				<CTAImageBlock
					className='py-(--container-padding)'
					color={'bright-yellow'}
					image={page.glossaryPageCta.ctaAssets?.img_featuredImage}
					label={page.glossaryPageCta.overview?.field_label}
					title={page.glossaryPageCta.overview?.field_title}
					copy={<RichData value={page.glossaryPageCta.overview?.block_summaryText} />}
					caption={page.glossaryPageCta.overview?.field_caption}
					primaryButton={
						page.glossaryPageCta.primaryCTA
							? transformButtons([page.glossaryPageCta.primaryCTA] as unknown as ButtonType[])?.[0]
							: undefined
					}
					secondaryButton={
						page.glossaryPageCta.secondaryCTA
							? transformButtons([page.glossaryPageCta.secondaryCTA] as unknown as ButtonType[])?.[0]
							: undefined
					}
					mediaAlignment='right'
				/>
			)}
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: goodpartyOrg_glossaryQuery,
	});

	return StructureMetaData(parentMetadata, {
		name: page?.glossaryOverview?.field_name,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
