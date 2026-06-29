import type { Sections } from '~/PageSections';
import { getCodeDefaultElectionTemplate } from '~/lib/electionTemplateDefaults';
import {
	customElectionTemplatesQuery,
	globalElectionTemplateQuery,
} from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import type { TokenMap } from '~/lib/resolveTokens';

export type ElectionTemplateType = 'location' | 'position' | 'positionCandidates' | 'candidateProfile';

export type ElectionTargetType = 'place' | 'position' | 'candidate';

export type ElectionTemplateTarget = {
	targetType: ElectionTargetType;
	slug: string;
};

export type ElectionTemplateContext = {
	templateType: ElectionTemplateType;
	placeSlug?: string;
	positionSlug?: string;
	candidateSlug?: string;
	raceSlug?: string;
};

export type ResolvedElectionTemplate = {
	pageSections: Sections[];
	source: 'custom' | 'global' | 'codeDefault';
	tokens?: TokenMap;
};

type SanityTarget = {
	field_electionTargetType?: ElectionTargetType;
	field_electionTargetSlug?: string;
};

type CustomTemplateDoc = {
	_id: string;
	field_enabled?: boolean;
	field_priority?: number;
	field_electionTemplateType?: ElectionTemplateType;
	list_targets?: SanityTarget[];
	pageSections?: { list_pageSections?: Sections[] | null } | null;
};

type GlobalTemplateDoc = {
	pageSections?: { list_pageSections?: Sections[] | null } | null;
};

const TARGET_TYPE_RANK: Record<ElectionTargetType, number> = {
	candidate: 3,
	position: 2,
	place: 1,
};

function normalizeSlug(slug: string | undefined): string {
	return (slug ?? '').trim().toLowerCase();
}

function extractSections(doc: { pageSections?: { list_pageSections?: Sections[] | null } | null } | null): Sections[] | null {
	const sections = doc?.pageSections?.list_pageSections;
	if (!sections?.length) return null;
	return sections;
}

function contextTargets(ctx: ElectionTemplateContext): ElectionTemplateTarget[] {
	const targets: ElectionTemplateTarget[] = [];
	if (ctx.candidateSlug) {
		targets.push({ targetType: 'candidate', slug: normalizeSlug(ctx.candidateSlug) });
	}
	if (ctx.raceSlug) {
		targets.push({ targetType: 'position', slug: normalizeSlug(ctx.raceSlug) });
	} else if (ctx.positionSlug) {
		targets.push({ targetType: 'position', slug: normalizeSlug(ctx.positionSlug) });
	}
	if (ctx.placeSlug) {
		targets.push({ targetType: 'place', slug: normalizeSlug(ctx.placeSlug) });
	}
	return targets;
}

function targetMatches(docTarget: SanityTarget, ctxTarget: ElectionTemplateTarget): boolean {
	const docType = docTarget.field_electionTargetType;
	const docSlug = normalizeSlug(docTarget.field_electionTargetSlug);
	if (!docType || !docSlug) return false;
	if (docType !== ctxTarget.targetType) return false;
	if (ctxTarget.targetType === 'place') {
		return ctxTarget.slug === docSlug || ctxTarget.slug.startsWith(`${docSlug}/`);
	}
	return ctxTarget.slug === docSlug;
}

function scoreCustomTemplate(doc: CustomTemplateDoc, ctx: ElectionTemplateContext): number | null {
	if (doc.field_enabled === false) return null;
	if (doc.field_electionTemplateType !== ctx.templateType) return null;

	const ctxTargetsList = contextTargets(ctx);
	if (!ctxTargetsList.length || !doc.list_targets?.length) return null;

	let best = -1;
	for (const docTarget of doc.list_targets) {
		for (const ctxTarget of ctxTargetsList) {
			if (!targetMatches(docTarget, ctxTarget)) continue;
			const typeRank = TARGET_TYPE_RANK[ctxTarget.targetType] ?? 0;
			const slugDepth = normalizeSlug(docTarget.field_electionTargetSlug).split('/').filter(Boolean).length;
			const score = typeRank * 1000 + slugDepth * 10;
			best = Math.max(best, score);
		}
	}
	return best >= 0 ? best : null;
}

export function pickBestCustomTemplate(
	docs: CustomTemplateDoc[],
	ctx: ElectionTemplateContext,
): CustomTemplateDoc | null {
	let best: CustomTemplateDoc | null = null;
	let bestScore = -1;
	let bestPriority = Number.POSITIVE_INFINITY;

	for (const doc of docs) {
		const score = scoreCustomTemplate(doc, ctx);
		if (score == null) continue;
		const priority = doc.field_priority ?? 100;
		if (score > bestScore || (score === bestScore && priority < bestPriority)) {
			best = doc;
			bestScore = score;
			bestPriority = priority;
		}
	}
	return best;
}

async function fetchGlobalTemplate(templateType: ElectionTemplateType): Promise<Sections[] | null> {
	try {
		const doc = (await sanityFetch({
			query: globalElectionTemplateQuery,
			params: { templateType },
			tags: ['goodpartyOrg_globalTemplate', `goodpartyOrg_globalTemplate_${templateType}`],
		})) as GlobalTemplateDoc | null;
		return extractSections(doc);
	} catch (error) {
		console.error(`[election-template] global fetch failed for ${templateType}`, error);
		return null;
	}
}

async function fetchCustomTemplates(templateType: ElectionTemplateType): Promise<CustomTemplateDoc[]> {
	try {
		const docs = (await sanityFetch({
			query: customElectionTemplatesQuery,
			params: { templateType },
			tags: ['goodpartyOrg_customTemplate', `goodpartyOrg_customTemplate_${templateType}`],
		})) as CustomTemplateDoc[] | null;
		return docs ?? [];
	} catch (error) {
		console.error(`[election-template] custom fetch failed for ${templateType}`, error);
		return [];
	}
}

export async function resolveElectionTemplate(
	ctx: ElectionTemplateContext,
	options?: { tokens?: TokenMap },
): Promise<ResolvedElectionTemplate> {
	const codeDefault: ResolvedElectionTemplate = {
		pageSections: getCodeDefaultElectionTemplate(ctx.templateType),
		source: 'codeDefault',
		tokens: options?.tokens,
	};

	try {
		const customDocs = await fetchCustomTemplates(ctx.templateType);
		const bestCustom = pickBestCustomTemplate(customDocs, ctx);
		if (bestCustom) {
			const customSections = extractSections(bestCustom);
			if (customSections) {
				return { pageSections: customSections, source: 'custom', tokens: options?.tokens };
			}
			console.warn(`[election-template] custom template ${bestCustom._id} invalid, falling back to global`);
		}
	} catch (error) {
		console.error('[election-template] custom resolution error, falling back to global', error);
	}

	const globalSections = await fetchGlobalTemplate(ctx.templateType);
	if (globalSections) {
		return { pageSections: globalSections, source: 'global', tokens: options?.tokens };
	}

	console.warn(`[election-template] global template missing for ${ctx.templateType}, using code default`);
	return codeDefault;
}
