import { describe, expect, test } from 'bun:test';
import { normalizePath, entriesToRedirectMap, type RedirectEntry } from './redirect-map';

describe('normalizePath', () => {
	test('removes trailing slash from non-root paths', () => {
		expect(normalizePath('/about/')).toBe('/about');
		expect(normalizePath('/blog/article/slug/')).toBe('/blog/article/slug');
	});

	test('leaves root path unchanged', () => {
		// guards against stripping the lone "/" on every request
		expect(normalizePath('/')).toBe('/');
	});

	test('leaves paths without trailing slash unchanged', () => {
		expect(normalizePath('/about')).toBe('/about');
		expect(normalizePath('/blog')).toBe('/blog');
	});
});

describe('entriesToRedirectMap', () => {
	test('builds map from valid entries', () => {
		const entries: RedirectEntry[] = [
			{ field_fromUrl: '/old-page', field_toUrl: '/new-page', field_permanentRedirect: true },
			{ field_fromUrl: '/temp', field_toUrl: '/dest', field_permanentRedirect: false },
		];
		const map = entriesToRedirectMap(entries);
		expect(map['/old-page']).toEqual({ to: '/new-page', permanent: true });
		expect(map['/temp']).toEqual({ to: '/dest', permanent: false });
	});

	test('defaults permanent to false when field is absent', () => {
		// guards against undefined coercing to true and issuing 308s unexpectedly
		const map = entriesToRedirectMap([{ field_fromUrl: '/x', field_toUrl: '/y' }]);
		expect(map['/x']?.permanent).toBe(false);
	});

	test('normalizes trailing slash on fromUrl before keying', () => {
		// middleware normalizes request paths before lookup; entries must match
		const map = entriesToRedirectMap([{ field_fromUrl: '/old/', field_toUrl: '/new' }]);
		expect(map['/old']).toBeDefined();
		expect(map['/old/']).toBeUndefined();
	});

	test('skips entries missing fromUrl', () => {
		const map = entriesToRedirectMap([{ field_toUrl: '/dest' }]);
		expect(Object.keys(map)).toHaveLength(0);
	});

	test('skips entries missing toUrl', () => {
		const map = entriesToRedirectMap([{ field_fromUrl: '/src' }]);
		expect(Object.keys(map)).toHaveLength(0);
	});

	test('returns empty map for null input', () => {
		expect(entriesToRedirectMap(null)).toEqual({});
		expect(entriesToRedirectMap(undefined)).toEqual({});
	});

	test('returns empty map for empty array', () => {
		expect(entriesToRedirectMap([])).toEqual({});
	});
});
