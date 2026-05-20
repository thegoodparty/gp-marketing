/**
 * Serves /llms.txt per https://llmstxt.org/ — a curated, AI-friendly index of
 * the most important GoodParty.org content. Preview/staging hosts return a stub
 * matching the gating in src/app/robots.ts so draft content is not exposed.
 */

import { NextResponse } from 'next/server';
import { fetchLlmsTxtDoc, renderLlmsTxt } from '~/lib/llms-txt-entries';
import { getBaseUrl, isPreviewBaseUrl } from '~/lib/url';

export const revalidate = 3600;

const PREVIEW_BODY =
	'# GoodParty.org (preview)\n\n> Preview environment. Crawling and AI discovery are disabled here.\n';

const TEXT_HEADERS = {
	'Content-Type': 'text/plain; charset=utf-8',
	'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
} as const;

export async function GET() {
	const baseUrl = getBaseUrl();

	if (isPreviewBaseUrl(baseUrl)) {
		return new NextResponse(PREVIEW_BODY, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'X-Robots-Tag': 'noindex, nofollow',
			},
		});
	}

	const doc = await fetchLlmsTxtDoc(baseUrl);
	const body = renderLlmsTxt(doc);

	return new NextResponse(body, { headers: TEXT_HEADERS });
}
