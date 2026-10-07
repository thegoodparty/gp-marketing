import { describe, expect, test } from 'bun:test';
import { resolveProductAvatars, type ProductAvatarDeps } from './productAvatars';

const LIVE = 'aaaaaaaa-0000-4000-8000-000000000001';
const UNPUBLISHED = 'bbbbbbbb-0000-4000-8000-000000000002';
const NO_PROFILE = 'cccccccc-0000-4000-8000-000000000003';

const deps = (overrides: Partial<ProductAvatarDeps> = {}): ProductAvatarDeps & { reads: string[] } => {
	const reads: string[] = [];
	return {
		reads,
		async getPublishedPersonProfileIds() {
			return Promise.resolve(new Set([LIVE, UNPUBLISHED]));
		},
		async getPublicPersonProfileStatus(personId) {
			reads.push(personId);
			if (personId === LIVE) return Promise.resolve({ status: 'live', profile: { avatarUrl: ' https://assets.goodparty.org/chosen.png ' } as never });
			return Promise.resolve({ status: 'unpublished' });
		},
		...overrides,
	};
};

describe('resolveProductAvatars', () => {
	test('reads only the published people and keeps a live profile\'s photo', async () => {
		const d = deps();
		const avatars = await resolveProductAvatars([LIVE.toUpperCase(), UNPUBLISHED, NO_PROFILE, null, undefined], d);
		expect([...avatars.entries()]).toEqual([[LIVE, 'https://assets.goodparty.org/chosen.png']]);
		expect(d.reads.sort()).toEqual([LIVE, UNPUBLISHED]);
	});

	test('an unreadable published list means no overrides, not an error', async () => {
		const d = deps({ getPublishedPersonProfileIds: async () => Promise.resolve(null) });
		expect(await resolveProductAvatars([LIVE], d)).toEqual(new Map());
		expect(d.reads).toEqual([]);
	});

	test('a failing profile read leaves the feed photos in place', async () => {
		const d = deps({ getPublicPersonProfileStatus: async () => Promise.reject(new Error('boom')) });
		expect(await resolveProductAvatars([LIVE], d)).toEqual(new Map());
	});
});
