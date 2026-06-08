import { stegaClean } from 'next-sanity';

export const FAQ_PAGE_SLUG = 'frequently-asked-questions';
export const FAQ_PAGE_LABEL = 'Frequently Asked Questions';
export const FAQ_BASE_PATH = `/${FAQ_PAGE_SLUG}`;

export type FaqLike = {
	_id: string;
	faqOverview?: {
		field_question?: unknown;
	} | null;
};

export function slugifyFaqQuestion(question: string): string {
	return question
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function readQuestion(faq: FaqLike): string {
	const raw = faq.faqOverview?.field_question;
	if (typeof raw !== 'string') return '';
	const cleaned = stegaClean(raw);
	return typeof cleaned === 'string' ? cleaned.trim() : '';
}

function shortIdSuffix(id: string): string {
	const normalized = id.replace(/^drafts\./, '');
	return normalized.slice(-6).toLowerCase();
}

export function buildFaqSlugMap(faqs: ReadonlyArray<FaqLike>): Map<string, string> {
	const slugToId = new Map<string, string>();
	const idToSlug = new Map<string, string>();

	for (const faq of faqs) {
		const question = readQuestion(faq);
		const baseSlug = question ? slugifyFaqQuestion(question) : '';
		let slug = baseSlug || faq._id.replace(/^drafts\./, '');

		while (slugToId.has(slug) && slugToId.get(slug) !== faq._id) {
			slug = `${slug}-${shortIdSuffix(faq._id)}`;
		}

		slugToId.set(slug, faq._id);
		idToSlug.set(faq._id, slug);
	}

	return idToSlug;
}

export function getFaqSlug(faq: FaqLike, slugMap: ReadonlyMap<string, string>): string {
	return slugMap.get(faq._id) ?? faq._id.replace(/^drafts\./, '');
}

export function getFaqHref(faq: FaqLike, slugMap: ReadonlyMap<string, string>): string {
	return `${FAQ_BASE_PATH}/${getFaqSlug(faq, slugMap)}`;
}

export function findFaqBySlug(faqs: ReadonlyArray<FaqLike>, slug: string): FaqLike | undefined {
	const direct = faqs.find(faq => faq._id === slug || faq._id === `drafts.${slug}`);
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
