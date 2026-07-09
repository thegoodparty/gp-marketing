import { describe, expect, test } from 'bun:test';
import {
	resolveClaimProfileBlockBackgroundColor,
	resolveClaimProfileBlockText,
	resolveExampleCardPartyAffiliation,
} from './ClaimProfileBlockSection';

describe('resolveClaimProfileBlockText', () => {
	test('resolves profile tokens in headline and body from CMS content', () => {
		const tokens = { '[candidate name]': 'Jane Doe', '[office name]': 'Mayor' };
		expect(
			resolveClaimProfileBlockText(
				{
					field_headline: 'Claim profile for [candidate name]',
					field_body: 'Running for [office name]',
				},
				tokens,
			),
		).toEqual({
			headline: 'Claim profile for Jane Doe',
			body: 'Running for Mayor',
		});
	});

	test('returns undefined fields when CMS content is absent', () => {
		expect(resolveClaimProfileBlockText(null, { '[candidate name]': 'Jane Doe' })).toEqual({
			headline: undefined,
			body: undefined,
		});
	});
});

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
