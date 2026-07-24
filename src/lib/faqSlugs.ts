import { stegaClean } from 'next-sanity';

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
	const normalized = id.replace(/^drafts\./, '');
	return normalized.slice(-6).toLowerCase();
}

export function buildFaqSlugMap(faqs: ReadonlyArray<FaqLike>): Map<string, string> {
	const slugToId = new Map<string, string>();
	const idToSlug = new Map<string, string>();

	for (const faq of faqs) {
		const baseSlug = resolveBaseSlug(faq);
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

/** Resolve FAQ href for a single document (e.g. GROQ-dereferenced internal links). */
export function getFaqHrefForDocument(faq: FaqLike, allFaqs?: ReadonlyArray<FaqLike>): string {
	const slugMap = allFaqs ? buildFaqSlugMap(allFaqs) : buildFaqSlugMap([faq]);
	return getFaqHref(faq, slugMap);
}

type InternalLinkLike = {
	_type?: string;
	_id?: string;
	href?: string | null;
	faqOverview?: FaqLike['faqOverview'];
};

/** Prefer runtime FAQ slug resolution over GROQ coalesce(_id) fallback. */
export function resolveInternalLinkHref(link: InternalLinkLike | null | undefined): string | undefined {
	if (!link) return undefined;
	if (link._type === 'faq') {
		return getFaqHrefForDocument(link as FaqLike);
	}
	return typeof link.href === 'string' ? link.href : undefined;
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

function faqDedupeKey(faq: FaqLike): string {
	const slug = resolveBaseSlug(faq);
	return slug || faq._id.replace(/^drafts\./, '');
}

/** One sitemap entry per unique question (first FAQ wins); excludes collision-suffixed duplicates. */
export function getFaqSitemapEntries(faqs: ReadonlyArray<FaqLike>): FaqSitemapEntry[] {
	const slugMap = buildFaqSlugMap(faqs);
	const seenKeys = new Set<string>();
	const entries: FaqSitemapEntry[] = [];

	for (const faq of faqs) {
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
