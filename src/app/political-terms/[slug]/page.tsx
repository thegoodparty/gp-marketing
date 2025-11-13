import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { glossaryByLetterArrayQuery, glossaryHeroGroq, glossaryQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { RichData } from '~/ui/RichData';
import { Container } from '~/ui/Container';
import { Text } from '~/ui/Text';
import { getCashedTerms } from '~/lib/getCashedTerms';
import { searchTermsToABCD } from '~/lib/serchTermsToABCD';
import { GlossaryList } from '~/ui/GlossaryList';
import { GlossaryHero } from '~/ui/GlossaryHero';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';
import type { GlossaryTermCta } from 'sanity.types';
import { toPlainText } from '@portabletext/toolkit';
import { client } from '~/lib/client';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<{ _id: string; title: string; slug: string }>>(
		'*[_type=="glossary"][0..99]{_id,"title":glossaryTermOverview.field_glossaryTerm,"slug":glossaryTermOverview.field_slug}',
	);
	const letters = searchTermsToABCD(entries as any);
	const paths = [...letters.map(letter => letter.href), ...entries.map(entry => entry.slug)];
	return paths.map(entry => ({
		slug: entry,
	}));
}

export default async function Page(props: any) {
	const slug = (await props.params)['slug'];

	if (!slug || slug.length === 0) {
		notFound();
	}

	if (slug.length === 1) {
		const terms = await sanityFetch({
			query: glossaryByLetterArrayQuery,
			params: {
				slug,
			},
		});
		if (!terms) {
			notFound();
		}

		const hero = await sanityFetch({
			query: glossaryHeroGroq,
		});

		const searchTerms = (await getCashedTerms()).terms;
		return (
			<>
				<GlossaryHero
					title={hero?.glossaryOverview?.field_name ?? 'Terms Glossary'}
					copy={hero?.glossaryOverview?.field_pageSubtitle}
					navigation={searchTermsToABCD(searchTerms)}
					searchTerms={searchTerms}
				/>
				<GlossaryList
					items={terms
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

				{hero?.cta?.overview?.field_title && (
					<CTAImageBlock
						className='py-(--container-padding)'
						color={'bright-yellow'}
						image={hero?.cta?.ctaAssets?.img_featuredImage}
						label={hero?.cta?.overview?.field_label}
						title={hero?.cta?.overview?.field_title}
						copy={<RichData value={hero?.cta?.overview?.block_summaryText} />}
						caption={hero?.cta?.overview?.field_caption}
						primaryButton={hero?.cta?.primaryCTA ? transformButtons([hero.cta.primaryCTA] as unknown as ButtonType[])?.[0] : undefined}
						secondaryButton={
							hero?.cta?.secondaryCTA ? transformButtons([hero.cta.secondaryCTA] as unknown as ButtonType[])?.[0] : undefined
						}
						mediaAlignment='right'
					/>
				)}
			</>
		);
	}

	const page = await sanityFetch({
		query: glossaryQuery,
		params: {
			slug,
		},
	});
	if (!page) {
		notFound();
	}

	let cta = page.glossaryTermCta;

	if (!cta || !('overview' in cta && cta.overview?.field_title)) {
		const hero = await sanityFetch({
			query: glossaryHeroGroq,
		});
		cta = hero?.cta as unknown as GlossaryTermCta;
	}

	return (
		<div className='bg-goodparty-cream'>
			<Container size='xl' className='py-(--container-padding) flex flex-col gap-6'>
				<Text as='h1' styleType='heading-xl'>
					{`What is ${page.glossaryTermOverview?.field_glossaryTerm}?`}
				</Text>
				<Text as='div' styleType='body-1' className='flex flex-col gap-6 max-w-[43.75rem]'>
					<RichData value={page.glossaryTermOverview?.block_glossaryTermDefinition} />
				</Text>
			</Container>
			{cta && 'overview' in cta && cta.overview?.field_title && (
				<CTAImageBlock
					className='py-(--container-padding)'
					color={'bright-yellow'}
					image={cta.ctaAssets?.img_featuredImage}
					label={cta.overview?.field_label}
					title={cta.overview?.field_title}
					copy={<RichData value={cta.overview?.block_summaryText} />}
					caption={cta.overview?.field_caption}
					primaryButton={cta.primaryCTA ? transformButtons([cta.primaryCTA] as unknown as ButtonType[])?.[0] : undefined}
					secondaryButton={cta.secondaryCTA ? transformButtons([cta.secondaryCTA] as unknown as ButtonType[])?.[0] : undefined}
					mediaAlignment='right'
				/>
			)}
		</div>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const slug = (await props.params)['slug'];

	const parentMetadata = await parent;
	const page = await sanityFetch({
		query: glossaryQuery,
		params: {
			slug: slug,
		},
	});

	return StructureMetaData(parentMetadata, {
		name: page?.glossaryTermOverview?.field_glossaryTerm,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
