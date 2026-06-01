import 'server-only';

import { revalidateTag } from 'next/cache';

const PREVIEW_DRAFT_TAG_PREFIX = 'previewDrafts:' as const;

/**
 * Registers Sanity preview-draft tags with Next’s incremental cache for the current request.
 *
 * On Next.js 15, `revalidateTag` from `next/cache` is **synchronous** (typings return `undefined`);
 * it records tags on the request store—it does not return a Promise to await. Cache behavior
 * across requests still follows Next’s ISR / deployment model.
 *
 * After upgrading `next`, re-check `node_modules/next/dist/server/web/spec-extension/revalidate.d.ts`:
 * if `revalidateTag` becomes async, switch this helper to `async` and await internally once.
 */
export function revalidatePreviewDraftTags(tags: readonly string[]): void {
	for (const tag of tags) {
		revalidateTag(`${PREVIEW_DRAFT_TAG_PREFIX}${tag}`);
	}
}
