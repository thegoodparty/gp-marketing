import type { Sections } from '~/PageSections';
import { getCodeDefaultElectionTemplate } from '~/lib/electionTemplateDefaults';
import {
	customElectionTemplateByIdQuery,
	customElectionTemplateTargetsQuery,
	globalElectionTemplateQuery,
} from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import type { TokenMap } from '~/lib/resolveTokens';

export type LocationLevel = 'state' | 'county' | 'city' | 'district';

export type LocationTemplateType =
	| 'locationState'
	| 'locationCounty'
	| 'locationCity'
	| 'locationDistrict';

export type ElectionTemplateType =
	| LocationTemplateType
	| 'position'
	| 'positionCandidates'
	| 'candidateProfile';

/** @deprecated Legacy custom docs may still use this type for all location levels. */
export type LegacyLocationTemplateType = 'location';

export const LOCATION_TEMPLATE_TYPES: readonly LocationTemplateType[] = [
	'locationState',
	'locationCounty',
	'locationCity',
	'locationDistrict',
] as const;

export function isLocationTemplateType(
	templateType: ElectionTemplateType | LegacyLocationTemplateType | string | undefined,
): templateType is LocationTemplateType {
	return (
		templateType === 'locationState' ||
		templateType === 'locationCounty' ||
		templateType === 'locationCity' ||
		templateType === 'locationDistrict'
	);
}

export function locationTemplateTypeFromLevel(level: LocationLevel): LocationTemplateType {
	switch (level) {
		case 'state':
			return 'locationState';
		case 'county':
			return 'locationCounty';
		case 'city':
			return 'locationCity';
		case 'district':
			return 'locationDistrict';
	}
}

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

// Lightweight doc used for matching only — pageSections are fetched by id for the winner.
type CustomTemplateTargetsDoc = {
	_id: string;
	field_enabled?: boolean;
	field_priority?: number;
	field_electionTemplateType?: ElectionTemplateType | LegacyLocationTemplateType;
	_updatedAt?: string;
	list_targets?: SanityTarget[];
};

function customTemplateTypeMatches(
	docType: ElectionTemplateType | LegacyLocationTemplateType | undefined,
	ctxType: ElectionTemplateType,
): boolean {
	if (!docType) return false;
	if (docType === ctxType) return true;
	if (docType === 'location' && isLocationTemplateType(ctxType)) return true;
	return false;
}

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

function scoreCustomTemplate(doc: CustomTemplateTargetsDoc, ctx: ElectionTemplateContext): number | null {
	if (doc.field_enabled === false) return null;
	if (!customTemplateTypeMatches(doc.field_electionTemplateType, ctx.templateType)) return null;

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
	docs: CustomTemplateTargetsDoc[],
	ctx: ElectionTemplateContext,
): CustomTemplateTargetsDoc | null {
	let best: CustomTemplateTargetsDoc | null = null;
	let bestScore = -1;
	let bestPriority = Number.POSITIVE_INFINITY;
	let bestUpdatedAt = '';

	for (const doc of docs) {
		const score = scoreCustomTemplate(doc, ctx);
		if (score == null) continue;
		const priority = doc.field_priority ?? 100;
		const updatedAt = doc._updatedAt ?? '';
		// Higher specificity wins; ties break on lower priority, then most-recently updated —
		// so the result does not depend on the order docs come back from the query.
		const better =
			score > bestScore ||
			(score === bestScore && priority < bestPriority) ||
			(score === bestScore && priority === bestPriority && updatedAt > bestUpdatedAt);
		if (better) {
			best = doc;
			bestScore = score;
			bestPriority = priority;
			bestUpdatedAt = updatedAt;
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

function customTemplateTypesForQuery(templateType: ElectionTemplateType): Array<ElectionTemplateType | LegacyLocationTemplateType> {
	if (isLocationTemplateType(templateType)) {
		return [templateType, 'location'];
	}
	return [templateType];
}

async function fetchCustomTemplateTargets(templateType: ElectionTemplateType): Promise<CustomTemplateTargetsDoc[]> {
	try {
		const docs = (await sanityFetch({
			query: customElectionTemplateTargetsQuery,
			params: { templateTypes: customTemplateTypesForQuery(templateType) },
			tags: ['goodpartyOrg_customTemplate', `goodpartyOrg_customTemplate_${templateType}`],
		})) as CustomTemplateTargetsDoc[] | null;
		return docs ?? [];
	} catch (error) {
		console.error(`[election-template] custom targets fetch failed for ${templateType}`, error);
		return [];
	}
}

async function fetchCustomTemplateSectionsById(
	id: string,
	templateType: ElectionTemplateType,
): Promise<Sections[] | null> {
	try {
		const doc = (await sanityFetch({
			query: customElectionTemplateByIdQuery,
			params: { id },
			tags: ['goodpartyOrg_customTemplate', `goodpartyOrg_customTemplate_${templateType}`],
		})) as { pageSections?: { list_pageSections?: Sections[] | null } | null } | null;
		return extractSections(doc);
	} catch (error) {
		console.error(`[election-template] custom sections fetch failed for ${id}`, error);
		return null;
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
		const customTargets = await fetchCustomTemplateTargets(ctx.templateType);
		const bestCustom = pickBestCustomTemplate(customTargets, ctx);
		if (bestCustom) {
			const customSections = await fetchCustomTemplateSectionsById(bestCustom._id, ctx.templateType);
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
