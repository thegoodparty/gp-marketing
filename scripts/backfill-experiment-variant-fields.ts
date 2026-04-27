/**
 * One-time backfill: set field_targetPages, field_status, field_priority on existing
 * experiment_variant documents after schema deploy.
 *
 * Requires write token:
 *   export SANITY_STUDIO_API_TOKEN="your-token-with-editor-permissions"
 *
 * Run:
 *   bun run scripts/backfill-experiment-variant-fields.ts
 */
import { createClient } from '@sanity/client';

const projectId = '3rbseux7';
const dataset = 'production';
const token = process.env['SANITY_STUDIO_API_TOKEN'];

if (!token) {
	console.error('Missing SANITY_STUDIO_API_TOKEN');
	process.exit(1);
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2025-09-25',
	useCdn: false,
});

const homeRef = { _type: 'reference' as const, _ref: 'goodpartyOrg_home', _key: 'targetHome' };

async function main() {
	const patches: Array<{ id: string; set: Record<string, unknown> }> = [
		{
			id: '038be548-3011-43bc-acb9-e3e9df9bdd78',
			set: {
				field_targetPages: [homeRef],
				field_status: 'running',
				field_priority: 100,
			},
		},
		{
			id: '4c434b7b-5417-431f-a2c2-520046c29eb2',
			set: {
				field_targetPages: [homeRef],
				field_status: 'draft',
				field_priority: 200,
			},
		},
	];

	for (const { id, set } of patches) {
		await client.patch(id).set(set).commit();
		console.log('Patched', id);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
