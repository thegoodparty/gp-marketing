import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { glossaryByLetterArrayQuery, glossaryHeroGroq, glossaryQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { RichData } from '~/ui/RichData';
import { Container } from '~/ui/Container';
import { Text } from '~/ui/Text';
import { getCachedTerms } from '~/lib/getCachedTerms';
import { searchTermsToABCD } from '~/lib/serchTermsToABCD';
import { GlossaryList } from '~/ui/GlossaryList';
import { GlossaryHero } from '~/ui/GlossaryHero';
import { CTAImageBlock } from '~/ui/CTAImageBlock';
import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';
import { toPlainText } from '@portabletext/toolkit';
import { client } from '~/lib/client';
import { cn } from '~/ui/_lib/utils';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';

export async function generateStaticParams() {
	const entries = await client.fetch<Array<{ _id: string; title: string; slug: string }>>(
		'*[_type=="glossary"][0..99]{_id,"title":glossaryTermOverview.field_glossaryTerm,"slug":glossaryTermOverview.field_slug}',
	);
	const letters = searchTermsToABCD(entries as any);
	const paths = [...letters.map(letter => letter.href), ...entries.map(entry => entry.slug)];
	return paths.filter(Boolean).map(entry => ({
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
			tags: ['glossary'],
		});
		if (!terms) {
			notFound();
		}

		const hero = await sanityFetch({
			query: glossaryHeroGroq,
			tags: ['glossary'],
		});

		const searchTerms = (await getCachedTerms()).terms;
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

				{hero?.cta?.ref_sharedCta?.overview?.field_title && (
					<CTAImageBlock
						className='py-(--container-padding)'
						color={resolveComponentColor(hero.cta.field_componentColor6ColorsInverse)}
						image={hero.cta.ref_sharedCta.ctaAssets?.img_featuredImage}
						showFullImage={hero.cta.ref_sharedCta.ctaAssets?.showFullImage}
						label={hero.cta.ref_sharedCta.overview.field_label}
						title={hero.cta.ref_sharedCta.overview.field_title}
						copy={<RichData value={hero.cta.ref_sharedCta.overview?.block_summaryText} />}
						caption={hero.cta?.ref_sharedCta.overview.field_caption}
						primaryButton={
							hero.cta.ref_sharedCta.primaryCTA
								? transformButtons([hero.cta.ref_sharedCta.primaryCTA] as unknown as ButtonType[])?.[0]
								: undefined
						}
						secondaryButton={
							hero.cta.ref_sharedCta.secondaryCTA
								? transformButtons([hero.cta.ref_sharedCta.secondaryCTA] as unknown as ButtonType[])?.[0]
								: undefined
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
		tags: ['glossary'],
	});
	if (!page) {
		notFound();
	}

	let cta = page.glossaryTermCta;

	if (!cta || !cta.ref_sharedCta?.overview?.field_title) {
		const hero = await sanityFetch({
			query: glossaryHeroGroq,
			tags: ['glossary'],
		});
		cta = hero?.cta as typeof page.glossaryTermCta;
	}

	const letter = page.glossaryTermOverview?.field_glossaryTerm?.charAt(0).toLowerCase() ?? '';
	const breadcrumbs = [
		{ href: '/political-terms', label: 'Political Terms' },
		...(letter ? [{ href: `/political-terms/${letter}`, label: letter.toUpperCase() }] : []),
		{
			href: page.href ?? `/political-terms/${slug}`,
			label: page.glossaryTermOverview?.field_glossaryTerm ?? '',
		},
	];

	return (
		<>
			<BreadcrumbBlock
				backgroundColor='cream'
				breadcrumbs={breadcrumbs}
				className='!pt-5 !pb-3'
			/>
			<div className='bg-goodparty-cream'>
				<Container size='xl' className='pt-4 pb-(--container-padding) flex flex-col gap-6'>
					<Text as='h1' styleType='heading-xl'>
						{page.glossaryTermOverview?.field_glossaryTerm}
					</Text>
					<Text
						as='div'
						styleType='body-1'
						className={cn(
							'flex flex-col gap-6 max-w-[43.75rem]',
							`[&_ul:not([class])]:pl-8 [&_ul:not([class])]:list-disc [&_ul:not([class])_ul]:mt-2 [&_ul:not([class])_li]:mb-[0.5em] [&_ol:not([class])]:list-none [&_ol:not([class])]:[counter-reset:section] [&_ol:not([class])_ol]:mt-2 [&_ol:not([class])_li]:pl-8 [&_ol:not([class])_li]:mb-[0.5em] [&_ol:not([class])_li]:[counter-increment:section] [&_ol:not([class])_li]:before:[content:counters(section,'.')] [&_ol:not([class])_li]:before:mr-3 [&_ol:not([class])_li]:before:font-medium`,
						)}
					>
						<RichData value={page.glossaryTermOverview?.block_glossaryTermDefinition} />
					</Text>
				</Container>
				{cta && cta.ref_sharedCta?.overview?.field_title && (
					<CTAImageBlock
						className='py-(--container-padding)'
						color={resolveComponentColor(cta.field_componentColor6ColorsInverse)}
						image={cta.ref_sharedCta.ctaAssets?.img_featuredImage}
						showFullImage={cta.ref_sharedCta.ctaAssets?.showFullImage}
						label={cta.ref_sharedCta.overview.field_label}
						title={cta.ref_sharedCta.overview.field_title}
						copy={<RichData value={cta.ref_sharedCta.overview.block_summaryText} />}
						caption={cta.ref_sharedCta.overview.field_caption}
						primaryButton={
							cta.ref_sharedCta?.primaryCTA ? transformButtons([cta.ref_sharedCta?.primaryCTA] as unknown as ButtonType[])?.[0] : undefined
						}
						secondaryButton={
							cta.ref_sharedCta?.secondaryCTA
								? transformButtons([cta.ref_sharedCta?.secondaryCTA] as unknown as ButtonType[])?.[0]
								: undefined
						}
						mediaAlignment='right'
					/>
				)}
			</div>
		</>
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
		tags: ['glossary'],
	});

	return StructureMetaData(parentMetadata, {
		name: page?.glossaryTermOverview?.field_glossaryTerm,
		seo: page?.seo,
		url: page?.href ?? undefined,
	});
}
