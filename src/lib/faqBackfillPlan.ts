import { getPublishedId } from 'sanity';
import { buildFaqSlugMap, getFaqSlug, sortFaqsForSlugMap, type FaqLike } from './faqSlugs';

export type FaqBackfillDoc = FaqLike & {
	_rev?: string;
	faqOverview?: {
		field_question?: string;
		field_slug?: string | null;
	} | null;
};

export type FaqBackfillPatch = {
	id: string;
	slug: string;
	reason: 'fill' | 'dedupe';
	rev?: string;
};

export type FaqBackfillPlanResult = {
	patches: FaqBackfillPatch[];
	skipped: number;
	preflightErrors: string[];
	duplicateSlugs: string[];
};

export function normalizeFaqDocumentId(id: string): string {
	return getPublishedId(id);
}

function readStoredSlug(faq: FaqBackfillDoc): string {
	const slug = faq.faqOverview?.field_slug;
	return typeof slug === 'string' ? slug.trim() : '';
}

function isPublishedId(id: string): boolean {
	return id === getPublishedId(id);
}

function pickRepresentative(docs: FaqBackfillDoc[]): FaqBackfillDoc {
	const published = docs.find(doc => isPublishedId(doc._id));
	if (published) return published;

	const drafts = docs.filter(doc => doc._id.startsWith('drafts.'));
	if (drafts.length > 0) {
		const firstDraft = [...drafts].sort((a, b) => a._id.localeCompare(b._id))[0];
		if (firstDraft) return firstDraft;
	}

	const first = [...docs].sort((a, b) => a._id.localeCompare(b._id))[0];
	if (!first) throw new Error('pickRepresentative called with empty document group');
	return first;
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

export function findDuplicateEffectiveSlugs(faqs: ReadonlyArray<FaqBackfillDoc>): string[] {
	const groups = groupFaqDocumentsByLogicalId(faqs);
	const representatives = [...groups.values()].map(pickRepresentative);
	const counts = new Map<string, number>();

	for (const faq of representatives) {
		const slug = readStoredSlug(faq);
		if (!slug) continue;
		counts.set(slug, (counts.get(slug) ?? 0) + 1);
	}

	return [...counts.entries()]
		.filter(([, count]) => count > 1)
		.map(([slug]) => slug)
		.sort((a, b) => a.localeCompare(b));
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
				...(doc._rev ? { rev: doc._rev } : {}),
			});
		}
	}

	return {
		patches: patches.sort((a, b) => a.id.localeCompare(b.id)),
		skipped,
		preflightErrors,
		duplicateSlugs: findDuplicateEffectiveSlugs(faqs),
	};
}

export function auditFaqSlugInvariants(faqs: ReadonlyArray<FaqBackfillDoc>): {
	ok: boolean;
	remainingPatches: number;
	preflightErrors: string[];
	duplicateSlugs: string[];
} {
	const plan = planFaqSlugBackfill(faqs);
	return {
		ok: plan.patches.length === 0 && plan.preflightErrors.length === 0 && plan.duplicateSlugs.length === 0,
		remainingPatches: plan.patches.length,
		preflightErrors: plan.preflightErrors,
		duplicateSlugs: plan.duplicateSlugs,
	};
}
