import { describe, expect, test } from 'bun:test';
import { resolveExampleCardPartyAffiliation } from './ClaimProfileBlockSection';

describe('resolveExampleCardPartyAffiliation', () => {
	test('returns override when present', () => {
		expect(
			resolveExampleCardPartyAffiliation('Independent', {
				field_partyAffiliation: 'City Council Member',
				field_secondaryText: 'Additional info',
			}),
		).toBe('Independent');
	});

	test('falls back to field_partyAffiliation', () => {
		expect(
			resolveExampleCardPartyAffiliation(undefined, {
				field_partyAffiliation: 'School Board Trustee',
			}),
		).toBe('School Board Trustee');
	});

	test('does not use field_secondaryText', () => {
		expect(
			resolveExampleCardPartyAffiliation(undefined, {
				field_secondaryText: 'Additional info',
			}),
		).toBe('');
	});

	test('returns empty string when all values are absent', () => {
		expect(resolveExampleCardPartyAffiliation(undefined, undefined)).toBe('');
		expect(resolveExampleCardPartyAffiliation(undefined, {})).toBe('');
	});
});
