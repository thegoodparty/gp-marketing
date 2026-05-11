'use server';

import { draftMode } from 'next/headers';

import { revalidatePreviewDraftTags } from '~/lib/revalidatePreviewDraftTags';

export async function revalidate({ tags }: { tags: string[] }) {
	if ((await draftMode()).isEnabled) {
		revalidatePreviewDraftTags(tags);
	}
}
