/** Shared helpers for claimed-profile lookup audit (scripts + tests). */

export const CANDIDATES_SITE_BASE = 'https://candidates.goodparty.org';

export type LookupStatus = 'claimed' | 'lookup_failure' | 'skipped';

export type AuditRow = {
	slug: string;
	firstName: string;
	lastName: string;
	state?: string;
	positionName?: string;
	electionsRaceId: string;
	electionsPositionElection?: string;
	electionsIsPrimary?: boolean;
	electionsElectionDate?: string;
	gpCandidateId?: string | null;
	lookupStatus: LookupStatus;
	campaignId?: number;
	pledged?: boolean;
	productRaceId?: string;
	productPositionElection?: string;
	mismatchConfirmed: boolean;
	profileUrl: string;
	candidatesSiteUrl?: string;
	skipReason?: string;
};

export function vanitySlugFromCandidacySlug(slug: string): string {
	return slug.split('/')[0] ?? slug;
}

/** Decodes BallotReady brHashId to gid path for readable reports. */
export function decodeBrHashId(brHashId: string): string | undefined {
	try {
		return Buffer.from(brHashId, 'base64').toString('utf8');
	} catch {
		return undefined;
	}
}

export function positionElectionIdFromBrHash(brHashId: string): string | undefined {
	const decoded = decodeBrHashId(brHashId);
	const match = decoded?.match(/PositionElection\/(\d+)/);
	return match?.[1];
}

export function isPledgedCandidatesPage(html: string): boolean {
	return /pledged\\":true/.test(html) || /"pledged":true/.test(html);
}

export function extractProductRaceIdFromCandidatesHtml(html: string): string | undefined {
	const escaped = html.match(/raceId\\":\\"(Z2lk[^\\]+)\\"/);
	if (escaped?.[1]) return escaped[1];

	const plain = html.match(/"raceId":"(Z2lk[^"]+)"/);
	if (plain?.[1]) return plain[1];

	return undefined;
}

export function buildProfileUrl(siteBase: string, slug: string): string {
	const base = siteBase.replace(/\/$/, '');
	return `${base}/candidate/${slug}`;
}

export function buildCandidatesSiteUrl(vanitySlug: string): string {
	return `${CANDIDATES_SITE_BASE.replace(/\/$/, '')}/${vanitySlug}`;
}

export function toCsvRow(row: AuditRow): string {
	const cells = [
		row.slug,
		row.firstName,
		row.lastName,
		row.state ?? '',
		row.lookupStatus,
		row.mismatchConfirmed ? 'yes' : 'no',
		row.electionsPositionElection ?? '',
		row.productPositionElection ?? '',
		row.pledged === true ? 'yes' : row.pledged === false ? 'no' : '',
		row.gpCandidateId ?? '',
		row.campaignId?.toString() ?? '',
		row.profileUrl,
		row.candidatesSiteUrl ?? '',
	];
	return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
}

export const CSV_HEADER =
	'slug,firstName,lastName,state,lookupStatus,mismatchConfirmed,electionsPositionElection,productPositionElection,pledged,gpCandidateId,campaignId,profileUrl,candidatesSiteUrl';
