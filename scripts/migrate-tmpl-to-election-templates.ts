/**
 * Migrate legacy tmpl_* singletons to goodpartyOrg_globalTemplate documents.
 *
 * Reads live tmpl_* pageSections when present; otherwise uses electionsTemplateSeedSections.
 *
 * Requires write token:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run:
 *   bun run scripts/migrate-tmpl-to-election-templates.ts          # dry-run (default)
 *   bun run scripts/migrate-tmpl-to-election-templates.ts --write  # create/update globals
 */
import { createClient } from '@sanity/client';
import {
	globalElectionTemplateSeedDocuments,
	electionsTemplateSeedDocuments,
} from '../src/lib/electionsTemplateSeedSections.ts';

const projectId = '3rbseux7';
const dataset = 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];
const write = process.argv.includes('--write');

const LEGACY_GLOBAL_MAP: Record<
	string,
	(typeof globalElectionTemplateSeedDocuments)[number]['_id']
> = {
	tmpl_candidateProfile: 'globalTemplate_candidateProfile',
	tmpl_electionsPosition: 'globalTemplate_position',
	tmpl_electionsCandidates: 'globalTemplate_positionCandidates',
	tmpl_electionsStateIndex: 'globalTemplate_location',
};

const client = createClient({
	projectId,
	dataset,
	token: token ?? undefined,
	apiVersion: '2025-09-25',
	useCdn: false,
});

type LegacyDoc = {
	_id: string;
	_type: string;
	pageSections?: { list_pageSections?: unknown[] };
};

function legacySeedFor(id: string) {
	return electionsTemplateSeedDocuments.find(doc => doc._id === id);
}

async function main() {
	if (write && !token) {
		console.error('Missing SANITY_STUDIO_API_TOKEN (required for --write)');
		process.exit(1);
	}

	const legacyDocs = await client.fetch<LegacyDoc[]>(
		`*[_type match "tmpl_*"]{_id,_type,pageSections}`,
	);
	const legacyById = new Map(legacyDocs.map(doc => [doc._id.replace(/^drafts\./, ''), doc]));

	const plans: Array<{
		globalId: string;
		templateType: string;
		source: 'legacy-live' | 'seed';
		legacyId?: string;
		sectionCount: number;
	}> = [];

	for (const globalDoc of globalElectionTemplateSeedDocuments) {
		const legacyId = Object.entries(LEGACY_GLOBAL_MAP).find(([, gid]) => gid === globalDoc._id)?.[0];
		const live = legacyId ? legacyById.get(legacyId) : undefined;
		const liveSections = live?.pageSections?.list_pageSections;
		const seedSections = legacySeedFor(legacyId ?? '')?.pageSections?.list_pageSections;
		const sections = liveSections?.length ? liveSections : seedSections ?? globalDoc.pageSections.list_pageSections;
		const source = liveSections?.length ? 'legacy-live' : 'seed';

		plans.push({
			globalId: globalDoc._id,
			templateType: globalDoc.field_electionTemplateType,
			source,
			legacyId,
			sectionCount: sections?.length ?? 0,
		});

		const payload = {
			...globalDoc,
			pageSections: { list_pageSections: sections },
		};

		if (write) {
			await client.createOrReplace(payload);
			console.log(`[write] ${globalDoc._id} (${source}, ${sections?.length ?? 0} sections)`);
		} else {
			console.log(`[dry-run] would upsert ${globalDoc._id} from ${source} (${sections?.length ?? 0} sections)`);
		}
	}

	console.log('\nMigration plan:', JSON.stringify(plans, null, 2));
	if (!write) {
		console.log('\nDry run only. Re-run with --write to apply.');
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
