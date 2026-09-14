import { describe, expect, test } from 'bun:test';
import type { ResolvedMetadata } from 'next';
import type { Seo } from 'sanity.types';
import { StructureMetaData } from './StructureMetadata';

/**
 * Studio's SEO group has carried "No Index" / "No follow" toggles since the
 * schema was generated, but nothing read them: every page fell through to the
 * parent's robots directive, so a landing page marked noindex in Studio still
 * rendered an indexable page and still sat in the sitemap. 33 A/B variants and
 * internal drafts were marked and shipped indexable before this was caught.
 * These pin the flag to the rendered directive; sitemap-entries.ts drops the
 * same pages from the sitemap off the same field.
 */

const parentMetadata = {
	description: 'GoodParty.org',
	openGraph: { images: [] },
	robots: { index: true, follow: true },
} as unknown as ResolvedMetadata;

function pageWithSeo(seo: Partial<Seo>) {
	return { name: 'A page', url: '/a-page', seo: { _type: 'seo', ...seo } as Seo };
}

describe('StructureMetaData robots', () => {
	test('a page with no SEO toggles inherits the parent directive', async () => {
		const metadata = await StructureMetaData(parentMetadata, pageWithSeo({}));
		expect(metadata.robots).toEqual({ index: true, follow: true });
	});

	test('No Index renders noindex while leaving links followable', async () => {
		const metadata = await StructureMetaData(parentMetadata, pageWithSeo({ field_noIndex: true }));
		expect(metadata.robots).toEqual({ index: false, follow: true });
	});

	test('No follow renders nofollow on its own', async () => {
		const metadata = await StructureMetaData(parentMetadata, pageWithSeo({ field_noFollow: true }));
		expect(metadata.robots).toEqual({ index: true, follow: false });
	});

	test('both toggles together render noindex, nofollow', async () => {
		const metadata = await StructureMetaData(
			parentMetadata,
			pageWithSeo({ field_noIndex: true, field_noFollow: true }),
		);
		expect(metadata.robots).toEqual({ index: false, follow: false });
	});

	// An explicit `false` is the marketing team un-ticking a box, not a request to
	// override the site default — it has to read the same as never having ticked it.
	test('toggles explicitly set to false inherit rather than override', async () => {
		const metadata = await StructureMetaData(
			parentMetadata,
			pageWithSeo({ field_noIndex: false, field_noFollow: false }),
		);
		expect(metadata.robots).toEqual({ index: true, follow: true });
	});

	test('a page with no SEO object at all still inherits', async () => {
		const metadata = await StructureMetaData(parentMetadata, { name: 'Bare', url: '/bare' });
		expect(metadata.robots).toEqual({ index: true, follow: true });
	});
});

/**
 * Each toggle decides its own axis. Ticking "No follow" must not hand back
 * `index: true` and quietly re-index a page some ancestor had suppressed —
 * the permissive fallback is only for when there is no parent directive at all.
 * The suite's main fixture is `{ index: true, follow: true }`, which cannot tell
 * "inherited true" apart from "hardcoded true", so these vary the parent.
 */
describe('StructureMetaData robots inheritance per axis', () => {
	const noindexParent = {
		description: 'GoodParty.org',
		openGraph: { images: [] },
		robots: { index: false, follow: false },
	} as unknown as ResolvedMetadata;

	test('No follow alone leaves the parent index directive alone', async () => {
		const metadata = await StructureMetaData(noindexParent, pageWithSeo({ field_noFollow: true }));
		expect(metadata.robots).toEqual({ index: false, follow: false });
	});

	test('No Index alone leaves the parent follow directive alone', async () => {
		const metadata = await StructureMetaData(noindexParent, pageWithSeo({ field_noIndex: true }));
		expect(metadata.robots).toEqual({ index: false, follow: false });
	});

	test('a toggle still applies when the parent says nothing', async () => {
		const bareParent = { description: 'GoodParty.org', openGraph: { images: [] } } as unknown as ResolvedMetadata;
		expect((await StructureMetaData(bareParent, pageWithSeo({ field_noIndex: true }))).robots).toEqual({
			index: false,
			follow: true,
		});
		expect((await StructureMetaData(bareParent, pageWithSeo({ field_noFollow: true }))).robots).toEqual({
			index: true,
			follow: false,
		});
	});
});
