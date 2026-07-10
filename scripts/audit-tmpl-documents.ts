/**
 * Read-only audit of legacy tmpl_* documents in Sanity.
 *
 * Run:
 *   bun run scripts/audit-tmpl-documents.ts
 *
 * Optional env:
 *   SANITY_STUDIO_API_TOKEN — use for private datasets (read works without token on production CDN)
 */
import { createClient } from '@sanity/client';

const projectId = '3rbseux7';
const dataset = 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2025-09-25',
	useCdn: !token,
});

const LEGACY_TMPL_IDS = [
	'tmpl_candidateProfile',
	'tmpl_electionsPosition',
	'tmpl_electionsCandidates',
	'tmpl_electionsStateIndex',
	'tmpl_electionsCountyIndex',
	'tmpl_electionsCityIndex',
	'tmpl_electionsDistrictIndex',
] as const;

const LEGACY_TO_GLOBAL: Record<string, string> = {
	tmpl_candidateProfile: 'globalTemplate_candidateProfile / candidateProfile',
	tmpl_electionsPosition: 'globalTemplate_position / position',
	tmpl_electionsCandidates: 'globalTemplate_positionCandidates / positionCandidates',
	tmpl_electionsStateIndex: 'globalTemplate_location / location (baseline)',
	tmpl_electionsCountyIndex: 'custom location template (place target) or fold into global',
	tmpl_electionsCityIndex: 'custom location template (place target) or fold into global',
	tmpl_electionsDistrictIndex: 'custom location template (place target) or fold into global',
};

type LegacyDoc = {
	_id: string;
	_type: string;
	_updatedAt?: string;
	pageSections?: { list_pageSections?: unknown[] };
};

async function main() {
	const docs = await client.fetch<LegacyDoc[]>(
		`*[_type match "tmpl_*"]{_id,_type,_updatedAt,pageSections{list_pageSections}}`,
	);

	const byId = new Map(docs.map(doc => [doc._id.replace(/^drafts\./, ''), doc]));
	const found: LegacyDoc[] = [];
	const missing: string[] = [];

	for (const id of LEGACY_TMPL_IDS) {
		const doc = byId.get(id);
		if (doc) found.push(doc);
		else missing.push(id);
	}

	console.log(JSON.stringify({ dataset, foundCount: found.length, missing }, null, 2));

	for (const doc of found) {
		const sectionCount = doc.pageSections?.list_pageSections?.length ?? 0;
		const mappedTo = LEGACY_TO_GLOBAL[doc._id.replace(/^drafts\./, '')] ?? 'unknown';
		console.log(
			`\n${doc._id} (${doc._type}) updated=${doc._updatedAt ?? 'n/a'} sections=${sectionCount} -> ${mappedTo}`,
		);
	}

	const globals = await client.fetch<{ _id: string; field_electionTemplateType?: string }[]>(
		`*[_type=="goodpartyOrg_globalTemplate"]{_id,field_electionTemplateType}`,
	);
	console.log('\nExisting global templates:', globals.length ? globals : 'none');
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
