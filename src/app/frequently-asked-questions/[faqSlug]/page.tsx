import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';
import { allFaqsQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { client } from '~/lib/client';
import { StructureMetaData } from '~/components/StructureMetadata';
import type { Params } from '~/lib/types';
import { FAQ_BASE_PATH, FAQ_PAGE_LABEL, findFaqBySlug, getAllFaqSlugs, getFaqHref, buildFaqSlugMap } from '~/lib/faqSlugs';
import { resolveFAQItemsAsText } from '~/lib/resolveFAQItemsAsText';
import { buildFAQSchema } from '~/lib/schema';
import { Anchor } from '~/ui/Anchor';
import { RichData } from '~/ui/RichData';
import { Container } from '~/ui/Container';
import { Text } from '~/ui/Text';
import { PageSchema } from '~/ui/PageSchema';
import { ArrowShortIcon } from '~/ui/icons/ArrowShortIcon';
import { cn } from '~/ui/_lib/utils';

export async function generateStaticParams() {
	const faqs = await client.fetch<Array<{ _id: string; faqOverview?: { field_question?: string } }>>(allFaqsQuery);
	return getAllFaqSlugs(faqs).map(faqSlug => ({ faqSlug }));
}

export default async function Page(props: Params) {
	const faqSlug = (await props.params)['faqSlug'];

	if (!faqSlug) {
		notFound();
	}

	const faqs = await sanityFetch({
		query: allFaqsQuery,
		tags: ['faq'],
	});

	const faq = findFaqBySlug(faqs ?? [], faqSlug);
	if (!faq) {
		notFound();
	}

	const faqTextItems = resolveFAQItemsAsText([faq]);
	const faqSchema = buildFAQSchema(faqTextItems);
	const question = faq.faqOverview?.field_question ? stegaClean(faq.faqOverview.field_question) : undefined;

	return (
		<>
			<PageSchema schema={faqSchema ?? undefined} />
			<div className='bg-goodparty-cream'>
				<Container size='xl' className='pt-4 pb-(--container-padding) flex flex-col gap-6'>
					<Anchor
						href={FAQ_BASE_PATH}
						className='group inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors w-fit'
					>
						<ArrowShortIcon
							size={24}
							className='rotate-180 flex-shrink-0'
							innerClassName='group-hover:animate-slide-in-right'
						/>
						{FAQ_PAGE_LABEL}
					</Anchor>
					{question && (
						<Text as='h1' styleType='heading-xl'>
							{question}
						</Text>
					)}
					<Text
						as='div'
						styleType='body-1'
						className={cn(
							'flex flex-col gap-6 max-w-[43.75rem]',
							`[&_ul:not([class])]:pl-8 [&_ul:not([class])]:list-disc [&_ul:not([class])_ul]:mt-2 [&_ul:not([class])_li]:mb-[0.5em] [&_ol:not([class])]:list-none [&_ol:not([class])]:[counter-reset:section] [&_ol:not([class])_ol]:mt-2 [&_ol:not([class])_li]:pl-8 [&_ol:not([class])_li]:mb-[0.5em] [&_ol:not([class])_li]:[counter-increment:section] [&_ol:not([class])_li]:before:[content:counters(section,'.')] [&_ol:not([class])_li]:before:mr-3 [&_ol:not([class])_li]:before:font-medium`,
						)}
					>
						<RichData value={faq.faqOverview?.block_answer} />
					</Text>
				</Container>
			</div>
		</>
	);
}

export async function generateMetadata(props: Params, parent: ResolvingMetadata): Promise<Metadata> {
	const faqSlug = (await props.params)['faqSlug'];
	const parentMetadata = await parent;

	const faqs = await sanityFetch({
		query: allFaqsQuery,
		tags: ['faq'],
	});
	const faq = findFaqBySlug(faqs ?? [], faqSlug);
	if (!faq) {
		return StructureMetaData(parentMetadata, null);
	}

	const slugMap = buildFaqSlugMap(faqs ?? []);
	const pageUrl = getFaqHref(faq, slugMap);
	const question = faq.faqOverview?.field_question
		? stegaClean(faq.faqOverview.field_question)
		: undefined;
	const answerText = resolveFAQItemsAsText([faq])[0]?.copy;
	const description = answerText && answerText.length > 160 ? `${answerText.slice(0, 157)}...` : answerText;

	return StructureMetaData(parentMetadata, {
		name: question,
		seo: {
			field_metaTitle: question,
			field_metaDescription: description,
		},
		url: pageUrl,
	});
}
