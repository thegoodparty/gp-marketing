import { describe, expect, test } from 'bun:test';
import type { ResolvedMetadata, ResolvingMetadata } from 'next';
import { StructureMetaData } from '~/components/StructureMetadata';
import { getBaseUrl, toAbsoluteUrl } from '~/lib/url';
import type { Params } from '~/lib/types';
import { generateMetadata } from './[slug]/page';

/**
 * The 25 `/political-terms/{letter}` URLs are the glossary's A–Z menu. No glossary
 * document backs them, so they used to fall through `StructureMetaData` with no
 * url and canonical to the bare site root — telling Google they were duplicates of
 * the homepage and routing the equity of every term page they link to the homepage
 * with it. They are `noindex, follow` now: out of the index on their own terms,
 * equity left with the term pages. `src/lib/sitemap-entries.ts` drops them to match.
 *
 * This is a `.test.ts` even though it imports a `.tsx` page: importing the page's
 * module graph into the DOM half timed out HubSpotEmbedForm's script-failure test,
 * and nothing here renders, so the logic half is where it belongs.
 */

const parentMetadata = {
	description: 'GoodParty.org',
	openGraph: { images: [] },
	robots: { index: true, follow: true },
} as unknown as ResolvedMetadata;

function props(slug: string): Params {
	return { params: Promise.resolve({ slug }) } as unknown as Params;
}

const parent = Promise.resolve(parentMetadata) as unknown as ResolvingMetadata;

describe('glossary letter page metadata', () => {
	test('every letter page is noindex, follow', async () => {
		for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
			const metadata = await generateMetadata(props(letter), parent);
			expect(metadata.robots, `/political-terms/${letter}`).toEqual({ index: false, follow: true });
		}
	});

	test('a letter page canonicals to itself rather than the homepage', async () => {
		const metadata = await generateMetadata(props('q'), parent);
		expect(metadata.alternates?.canonical).toBe(toAbsoluteUrl('/political-terms/q'));
		expect(metadata.alternates?.canonical).not.toBe(getBaseUrl());
	});

	test('the homepage canonical is still what a url-less page resolves to', async () => {
		const fallback = await StructureMetaData(parentMetadata, null);
		expect(fallback.alternates.canonical).toBe(getBaseUrl());
	});
});
