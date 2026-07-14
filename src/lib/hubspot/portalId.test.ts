import { afterEach, describe, expect, test } from 'bun:test';

import { getHubSpotPortalId } from './portalId';

describe('getHubSpotPortalId', () => {
	const original = process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'];

	afterEach(() => {
		if (original === undefined) {
			delete process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'];
		} else {
			process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] = original;
		}
	});

	test('returns env portal id when set', () => {
		process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] = '12345678';
		expect(getHubSpotPortalId()).toBe('12345678');
	});

	test('falls back to default portal id', () => {
		delete process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'];
		expect(getHubSpotPortalId()).toBe('21589597');
	});
});
