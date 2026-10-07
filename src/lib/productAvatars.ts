import { getPublicPersonProfileStatus, getPublishedPersonProfileIds } from '~/lib/electionsApi';

export type ProductAvatarDeps = {
	getPublishedPersonProfileIds: typeof getPublishedPersonProfileIds;
	getPublicPersonProfileStatus: typeof getPublicPersonProfileStatus;
};

const defaultDeps: ProductAvatarDeps = { getPublishedPersonProfileIds, getPublicPersonProfileStatus };

const CONCURRENT_PROFILE_READS = 6;

/**
 * The photo a person chose for their own GoodParty.org profile, keyed by
 * lower-cased person id, for whichever of `personIds` has a published profile.
 * The position page showed Thomas Nguyen in a tux from BallotReady's feed while
 * his profile showed the photo he uploaded (Emily, 2026-10-07): the person's
 * own choice wins wherever they appear, the way the profile page already
 * reads `overlay.avatarUrl ?? person.headshotUrl`.
 *
 * gp-api has no bulk read for profiles, so the published list (a few dozen
 * rows, cached) narrows the ids first and only those are fetched, six at a
 * time. Any failure yields an empty map and the cards keep their feed photo.
 */
export async function resolveProductAvatars(personIds: Iterable<string | null | undefined>, deps: ProductAvatarDeps = defaultDeps): Promise<Map<string, string>> {
	const avatars = new Map<string, string>();
	try {
		const published = await deps.getPublishedPersonProfileIds();
		if (!published || published.size === 0) return avatars;
		const wanted = [...new Set([...personIds].flatMap(id => (id ? [id.toLowerCase()] : [])))].filter(id => published.has(id));
		for (let i = 0; i < wanted.length; i += CONCURRENT_PROFILE_READS) {
			await Promise.all(
				wanted.slice(i, i + CONCURRENT_PROFILE_READS).map(async id => {
					const result = await deps.getPublicPersonProfileStatus(id);
					const url = result.status === 'live' ? result.profile.avatarUrl?.trim() : undefined;
					if (url) avatars.set(id, url);
				}),
			);
		}
	} catch (err) {
		console.error('[productAvatars] falling back to feed photos', err);
	}
	return avatars;
}
