/**
 * Turns the data team's export of retired DDHQ-only profiles
 * (ddhq_retired_indexed_earning.csv, ClickUp DATA-2674) into the map the
 * middleware answers from (`src/lib/people-retired-ddhq.data.ts`). One row per
 * retired URL; John's recommendation per row is `410`, `review`, or a redirect
 * with `race_slug` set. A set race slug forwards to that office; `410` and
 * `review` are gone, because a page with no successor has no honest redirect
 * (the ticket leaves `review` rows to Emily; give a row a race slug to forward it).
 */

export interface RetiredDdhqMap {
	redirects: Record<string, string>;
	gone: string[];
	rows: number;
}

const SLUG_HEADERS = new Set(['url', 'page', 'path', 'slug', 'people_url', 'person_slug', 'person_url', 'people_slug']);
const RACE_SLUG_HEADERS = new Set(['race_slug', 'raceslug', 'race']);
const GONE_ACTIONS = new Set(['410', 'gone', 'review']);
const REDIRECT_ACTIONS = new Set(['301', '308', 'redirect']);

/** RFC 4180 enough for a spreadsheet export: quoted fields, doubled quotes, CRLF. */
export const parseCsv = (text: string): string[][] => {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i]!;
		if (quoted) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else quoted = false;
			} else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else field += c;
	}
	if (field !== '' || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows.filter(r => r.some(f => f.trim() !== ''));
};

const normalizeHeader = (h: string): string => h.trim().toLowerCase().replace(/^﻿/, '').replace(/[\s-]+/g, '_');

const findColumn = (headers: string[], rows: string[][]): { slug: number; action: number; race: number } => {
	const slugByHeader = headers.findIndex(h => SLUG_HEADERS.has(h));
	const slugByValue = headers.findIndex((_, i) => rows.slice(0, 50).some(r => (r[i] ?? '').includes('/people/')));
	const slug = slugByHeader >= 0 ? slugByHeader : slugByValue;
	const action = headers.findIndex(h => /recommend|action/.test(h));
	const race = headers.findIndex(h => RACE_SLUG_HEADERS.has(h));
	const missing = [slug < 0 && 'the /people URL or slug', action < 0 && 'the recommended action', race < 0 && 'race_slug'].filter(
		Boolean,
	);
	if (missing.length > 0) {
		throw new Error(`Could not find a column for ${missing.join(', ')}. Headers: ${headers.join(', ')}`);
	}
	return { slug, action, race };
};

/** The slug part of a /people URL, whatever form the cell holds (full URL, path, or bare slug). */
export const slugFromCell = (cell: string): string => {
	let value = cell.trim().toLowerCase();
	const peopleAt = value.lastIndexOf('/people/');
	if (peopleAt >= 0) value = value.slice(peopleAt + '/people/'.length);
	value = value.replace(/[?#].*$/, '').replace(/\/+$/, '');
	return value;
};

/** `de/newark/city-legislature` from any of the ways a race slug gets pasted. */
export const raceSlugFromCell = (cell: string): string =>
	cell
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\/[^/]+/, '')
		.replace(/^\/?elections\//, '')
		.replace(/^position\//, '')
		.replace(/^\/+|\/+$/g, '');

export const buildRetiredDdhqMap = (csvText: string): RetiredDdhqMap => {
	const parsed = parseCsv(csvText);
	const headerRow = parsed[0];
	if (!headerRow) throw new Error('The export is empty.');
	const headers = headerRow.map(normalizeHeader);
	const rows = parsed.slice(1);
	const col = findColumn(headers, rows);

	const redirects: Record<string, string> = {};
	const gone = new Set<string>();

	rows.forEach((row, index) => {
		const line = index + 2;
		const slug = slugFromCell(row[col.slug] ?? '');
		if (!slug || slug.includes('/') || !/^[a-z0-9-]*[0-9a-f]{8}$/.test(slug)) {
			throw new Error(`Line ${line}: "${row[col.slug]}" is not a /people/<base>-<id8> URL.`);
		}
		const raceSlug = raceSlugFromCell(row[col.race] ?? '');
		const action = (row[col.action] ?? '').trim().toLowerCase();

		if (raceSlug) {
			const segments = raceSlug.split('/');
			if (segments.length < 2 || segments.length > 5 || !/^[a-z]{2}$/.test(segments[0]!)) {
				throw new Error(`Line ${line}: race_slug "${raceSlug}" is not state/[county]/[city]/[subplace]/office.`);
			}
			const existing = redirects[slug];
			if (existing && existing !== raceSlug) {
				throw new Error(`Line ${line}: ${slug} is listed twice with different race slugs (${existing}, ${raceSlug}).`);
			}
			redirects[slug] = raceSlug;
			gone.delete(slug);
			return;
		}

		if (REDIRECT_ACTIONS.has(action)) {
			throw new Error(`Line ${line}: ${slug} is marked ${action} but has no race_slug to forward to.`);
		}
		if (!GONE_ACTIONS.has(action)) {
			throw new Error(`Line ${line}: ${slug} has an unknown recommendation "${action}" (expected 410, review, or a race_slug).`);
		}
		if (!redirects[slug]) gone.add(slug);
	});

	return { redirects, gone: [...gone].sort(), rows: rows.length };
};

export const renderRetiredDdhqDataModule = (map: RetiredDdhqMap, source: { file: string; generatedAt: string }): string => {
	const redirectEntries = Object.keys(map.redirects)
		.sort()
		.map(slug => `\t'${slug}': '${map.redirects[slug]}',`)
		.join('\n');
	return [
		'// Generated by scripts/generate-people-retired-ddhq.ts. Do not edit by hand.',
		'//',
		`// Source: ${source.file}`,
		`// Rows read: ${map.rows}. Redirects: ${Object.keys(map.redirects).length}. Gone: ${map.gone.length}.`,
		'',
		'export const RETIRED_DDHQ_SOURCE = {',
		`\tfile: '${source.file}',`,
		`\tgeneratedAt: '${source.generatedAt}',`,
		`\trows: ${map.rows},`,
		'} as const;',
		'',
		'/** Retired /people slug to the race slug of the office it was running for. */',
		'export const RETIRED_DDHQ_REDIRECTS: Record<string, string> = {',
		redirectEntries,
		'};',
		'',
		'/** Retired /people slugs with no successor, one per line. */',
		`export const RETIRED_DDHQ_GONE = \`${map.gone.join('\n')}\`;`,
		'',
	].join('\n');
};
