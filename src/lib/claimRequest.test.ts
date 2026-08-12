import { describe, expect, test } from 'bun:test';
import { buildClaimRequestBody, isClaimRequestSource } from './claimRequest';

/**
 * `source` is the only thing that tells gp-api which of the two claim forms a
 * submission came from, and it decides whether the submission counts towards
 * that person's HubSpot `candidate_profile_requests`. Getting it wrong is
 * silent: no error surfaces on the site or in HubSpot, the number just stops
 * reflecting reality.
 */

const PERSON_ID = '74eee01a-1111-4222-8333-444444444444';
const EMAIL = 'visitor@example.com';

const parse = (body: string) => JSON.parse(body) as Record<string, unknown>;

describe('buildClaimRequestBody', () => {
	test('marks a visitor nudge as notify, the submissions the counter is built on', () => {
		const body = parse(
			buildClaimRequestBody({
				personId: PERSON_ID,
				email: EMAIL,
				firstname: 'Curious Voter',
				marketingConsent: true,
				source: 'notify',
			}),
		);

		expect(body).toEqual({
			personId: PERSON_ID,
			firstname: 'Curious Voter',
			email: EMAIL,
			marketingConsent: true,
			source: 'notify',
		});
	});

	test('marks a self-claim as owner, so it never inflates the counter', () => {
		const body = parse(
			buildClaimRequestBody({
				personId: PERSON_ID,
				email: EMAIL,
				firstname: 'Jane Rivera',
				source: 'owner',
			}),
		);

		expect(body['source']).toBe('owner');
	});

	test('omits marketingConsent entirely when the form has no opt-in checkbox', () => {
		// The owner band carries no checkbox. Omitting lets the proxy record the
		// absence as false; sending false here would be indistinguishable from a
		// visitor who deliberately unticked it.
		const body = parse(buildClaimRequestBody({ personId: PERSON_ID, email: EMAIL, source: 'owner' }));

		expect(body).not.toHaveProperty('marketingConsent');
	});

	test('keeps a false opt-in, which is a real answer rather than an absent one', () => {
		const body = parse(
			buildClaimRequestBody({ personId: PERSON_ID, email: EMAIL, marketingConsent: false, source: 'notify' }),
		);

		expect(body['marketingConsent']).toBe(false);
	});
});

describe('isClaimRequestSource', () => {
	test('accepts the two values gp-api recognises', () => {
		expect(isClaimRequestSource('notify')).toBe(true);
		expect(isClaimRequestSource('owner')).toBe(true);
	});

	test('rejects anything else, so a bad value is never forwarded', () => {
		// gp-api validates the enum strictly and 400s an unrecognised value, which
		// would lose the whole lead.
		expect(isClaimRequestSource('NOTIFY')).toBe(false);
		expect(isClaimRequestSource('person-claim-notify')).toBe(false);
		expect(isClaimRequestSource(undefined)).toBe(false);
		expect(isClaimRequestSource(null)).toBe(false);
		expect(isClaimRequestSource(1)).toBe(false);
	});
});
