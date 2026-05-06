import { NextResponse } from 'next/server';
import {
	REDIRECTS_GROQ,
	entriesToRedirectMap,
	type RedirectEntry,
} from '~/lib/redirect-map';
import { sanityClient } from '~/sanity/sanityClient';

export async function GET() {
	const entries = await sanityClient.fetch<RedirectEntry[] | null>(REDIRECTS_GROQ, {}, {
		next: { tags: ['goodpartyOrg_redirects'] },
	});

	return NextResponse.json(entriesToRedirectMap(entries));
}
