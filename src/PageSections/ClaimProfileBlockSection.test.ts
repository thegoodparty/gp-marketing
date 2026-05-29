import { describe, expect, test } from 'bun:test';
import {
	resolveClaimProfileBlockBackgroundColor,
	resolveExampleCardPartyAffiliation,
} from './ClaimProfileBlockSection';

describe('resolveClaimProfileBlockBackgroundColor', () => {
	test('maps CMS midnight value', () => {
		expect(resolveClaimProfileBlockBackgroundColor('midnight')).toBe('midnight');
	});

	test('maps legacy MidnightDark value from static templates', () => {
		expect(resolveClaimProfileBlockBackgroundColor('MidnightDark')).toBe('midnight');
	});

	test('maps CMS cream value', () => {
		expect(resolveClaimProfileBlockBackgroundColor('cream')).toBe('cream');
	});

	test('maps legacy Cream value from static templates', () => {
		expect(resolveClaimProfileBlockBackgroundColor('Cream')).toBe('cream');
	});

	test('defaults to cream when unset', () => {
		expect(resolveClaimProfileBlockBackgroundColor(undefined)).toBe('cream');
	});
});

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
