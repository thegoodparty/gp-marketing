/**
 * Lightweight Sanity client for build scripts (sitemap generation).
 * Uses env config; avoids importing src/sanity/sanityClient which depends on Next.js runtime (draftMode).
 */

import { createClient } from '@sanity/client';

const projectId = process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? '3rbseux7';
const dataset = process.env['NEXT_PUBLIC_SANITY_DATASET'] ?? 'production';

export const scriptSanityClient = createClient({
	projectId,
	dataset,
	apiVersion: '2025-10-08',
	useCdn: true,
	perspective: 'published',
});
