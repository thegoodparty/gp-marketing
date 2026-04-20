import { NextResponse } from 'next/server';
import { sanityClient } from '~/sanity/sanityClient';

interface RedirectEntry {
	field_fromUrl?: string;
	field_toUrl?: string;
	field_permanentRedirect?: boolean;
}

const QUERY = `*[_type=="goodpartyOrg_redirects"][0].list_redirects[]{field_fromUrl,field_toUrl,field_permanentRedirect}`;

function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export async function GET() {
	const entries = await sanityClient.fetch<RedirectEntry[] | null>(QUERY, undefined, {
		next: { tags: ['goodpartyOrg_redirects'] },
	});

	const map: Record<string, { to: string; permanent: boolean }> = {};

	if (entries) {
		for (const entry of entries) {
			if (entry.field_fromUrl && entry.field_toUrl) {
				map[normalizePath(entry.field_fromUrl)] = {
					to: entry.field_toUrl,
					permanent: entry.field_permanentRedirect ?? false,
				};
			}
		}
	}

	return NextResponse.json(map);
}
