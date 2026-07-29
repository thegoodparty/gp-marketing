import { stegaClean } from 'next-sanity';
import { getPublishedId } from 'sanity';
import { slugifyFaqQuestion } from './faqSlugFormat';

export { slugifyFaqQuestion, isValidFaqSlug, validateFaqSlugFormat } from './faqSlugFormat';

export const FAQ_PAGE_SLUG = 'frequently-asked-questions';
export const FAQ_PAGE_LABEL = 'Frequently Asked Questions';
export const FAQ_BASE_PATH = `/${FAQ_PAGE_SLUG}`;

export type FaqLike = {
	_id: string;
	_updatedAt?: string;
	faqOverview?: {
		field_question?: unknown;
		field_slug?: string | null;
	} | null;
};

export type FaqSitemapEntry = {
	slug: string;
	faq: FaqLike;
};

export function normalizeFaqLogicalId(id: string): string {
	return getPublishedId(id);
}

function readQuestion(faq: FaqLike): string {
	const raw = faq.faqOverview?.field_question;
	if (typeof raw !== 'string') return '';
	const cleaned = stegaClean(raw);
	return typeof cleaned === 'string' ? cleaned.trim() : '';
}

function readStoredSlug(faq: FaqLike): string {
	const raw = faq.faqOverview?.field_slug;
	if (typeof raw !== 'string') return '';
	const cleaned = stegaClean(raw);
	return typeof cleaned === 'string' ? cleaned.trim() : '';
}

function resolveBaseSlug(faq: FaqLike): string {
	const storedSlug = readStoredSlug(faq);
	if (storedSlug) return storedSlug;

	const question = readQuestion(faq);
	return question ? slugifyFaqQuestion(question) : '';
}

function shortIdSuffix(id: string): string {
	return normalizeFaqLogicalId(id).slice(-6).toLowerCase();
}

function compareFaqsForSlugMap(a: FaqLike, b: FaqLike): number {
	const baseA = resolveBaseSlug(a) || normalizeFaqLogicalId(a._id);
	const baseB = resolveBaseSlug(b) || normalizeFaqLogicalId(b._id);
	if (baseA.length !== baseB.length) return baseA.length - baseB.length;

	const baseCompare = baseA.localeCompare(baseB);
	if (baseCompare !== 0) return baseCompare;

	const questionCompare = readQuestion(a).localeCompare(readQuestion(b));
	if (questionCompare !== 0) return questionCompare;

	const normalizedIdCompare = normalizeFaqLogicalId(a._id).localeCompare(normalizeFaqLogicalId(b._id));
	if (normalizedIdCompare !== 0) return normalizedIdCompare;
	return a._id.localeCompare(b._id);
}

export function sortFaqsForSlugMap(faqs: ReadonlyArray<FaqLike>): FaqLike[] {
	return [...faqs].sort(compareFaqsForSlugMap);
}

export function buildFaqSlugMap(faqs: ReadonlyArray<FaqLike>): Map<string, string> {
	const slugToId = new Map<string, string>();
	const idToSlug = new Map<string, string>();

	for (const faq of sortFaqsForSlugMap(faqs)) {
		const baseSlug = resolveBaseSlug(faq);
		let slug = baseSlug || normalizeFaqLogicalId(faq._id);

		while (slugToId.has(slug) && slugToId.get(slug) !== faq._id) {
			slug = `${slug}-${shortIdSuffix(faq._id)}`;
		}

		slugToId.set(slug, faq._id);
		idToSlug.set(faq._id, slug);
	}

	return idToSlug;
}

export function getFaqSlug(faq: FaqLike, slugMap: ReadonlyMap<string, string>): string {
	return slugMap.get(faq._id) ?? normalizeFaqLogicalId(faq._id);
}

export function getFaqHref(faq: FaqLike, slugMap: ReadonlyMap<string, string>): string {
	return `${FAQ_BASE_PATH}/${getFaqSlug(faq, slugMap)}`;
}

export function findFaqBySlug(faqs: ReadonlyArray<FaqLike>, slug: string): FaqLike | undefined {
	const direct = faqs.find(faq => faq._id === slug || normalizeFaqLogicalId(faq._id) === slug);
	if (direct) return direct;

	const slugMap = buildFaqSlugMap(faqs);
	for (const faq of faqs) {
		if (getFaqSlug(faq, slugMap) === slug) return faq;
	}

	return undefined;
}

export function getAllFaqSlugs(faqs: ReadonlyArray<FaqLike>): string[] {
	const slugMap = buildFaqSlugMap(faqs);
	return faqs.map(faq => getFaqSlug(faq, slugMap));
}

function faqDedupeKey(faq: FaqLike): string {
	const question = readQuestion(faq);
	const slug = question ? slugifyFaqQuestion(question) : '';
	return slug || normalizeFaqLogicalId(faq._id);
}

/** One sitemap entry per unique question (first FAQ wins); excludes collision-suffixed duplicates. */
export function getFaqSitemapEntries(faqs: ReadonlyArray<FaqLike>): FaqSitemapEntry[] {
	const slugMap = buildFaqSlugMap(faqs);
	const seenKeys = new Set<string>();
	const entries: FaqSitemapEntry[] = [];

	for (const faq of sortFaqsForSlugMap(faqs)) {
		const key = faqDedupeKey(faq);
		if (seenKeys.has(key)) continue;
		seenKeys.add(key);

		const slug = getFaqSlug(faq, slugMap);
		if (slug) {
			entries.push({ slug, faq });
		}
	}

	return entries;
}
