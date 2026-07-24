import { buildFaqSlugMap, getFaqSlug, sortFaqsForSlugMap, type FaqLike } from './faqSlugs';

export type FaqBackfillDoc = FaqLike & {
	faqOverview?: {
		field_question?: string;
		field_slug?: string | null;
	} | null;
};

export type FaqBackfillPatch = {
	id: string;
	slug: string;
	reason: 'fill' | 'dedupe';
};

export type FaqBackfillPlanResult = {
	patches: FaqBackfillPatch[];
	skipped: number;
	preflightErrors: string[];
};

export function normalizeFaqDocumentId(id: string): string {
	return id.replace(/^drafts\./, '');
}

function readStoredSlug(faq: FaqBackfillDoc): string {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' ? slug.trim() : '';
}

function pickRepresentative(docs: FaqBackfillDoc[]): FaqBackfillDoc {
	const published = docs.find(doc => !doc._id.startsWith('drafts.'));
	return published ?? docs[0]!;
}

export function groupFaqDocumentsByLogicalId(faqs: ReadonlyArray<FaqBackfillDoc>): Map<string, FaqBackfillDoc[]> {
	const groups = new Map<string, FaqBackfillDoc[]>();

	for (const faq of faqs) {
		const key = normalizeFaqDocumentId(faq._id);
		const existing = groups.get(key) ?? [];
		existing.push(faq);
		groups.set(key, existing);
	}

	return groups;
}

export function planFaqSlugBackfill(faqs: ReadonlyArray<FaqBackfillDoc>): FaqBackfillPlanResult {
	const groups = groupFaqDocumentsByLogicalId(faqs);
	const representatives = sortFaqsForSlugMap([...groups.values()].map(pickRepresentative));
	const slugMap = buildFaqSlugMap(representatives);

	const patches: FaqBackfillPatch[] = [];
	const preflightErrors: string[] = [];
	let skipped = 0;

	for (const docs of groups.values()) {
		const representative = pickRepresentative(docs);
		const canonical = getFaqSlug(representative, slugMap);

		if (!canonical) {
			for (const doc of docs) {
				preflightErrors.push(`id=${doc._id} has no canonical slug`);
			}
			continue;
		}

		for (const doc of docs) {
			if (doc.faqOverview == null) {
				preflightErrors.push(`id=${doc._id} missing faqOverview`);
				continue;
			}

			const stored = readStoredSlug(doc);
			if (stored === canonical) {
				skipped++;
				continue;
			}

			patches.push({
				id: doc._id,
				slug: canonical,
				reason: stored ? 'dedupe' : 'fill',
			});
		}
	}

	return { patches: patches.sort((a, b) => a.id.localeCompare(b.id)), skipped, preflightErrors };
}
