import { describe, expect, test } from 'bun:test';
import {
	isButtonType,
	normalizeRawCtaToButton,
	resolveButtonHref,
	transformButtons,
} from './buttonTransformer';

describe('isButtonType', () => {
	test('rejects action: null', () => {
		expect(isButtonType({ action: null, _key: 'x' })).toBe(false);
	});

	test('rejects missing action', () => {
		expect(isButtonType({ _key: 'x' })).toBe(false);
	});

	test('accepts valid action', () => {
		expect(isButtonType({ action: 'Internal', _key: 'x' })).toBe(true);
	});
});

describe('normalizeRawCtaToButton', () => {
	test('maps field_* aliases to action and text', () => {
		const button = normalizeRawCtaToButton(
			{
				field_ctaActionWithShared: 'Internal',
				field_buttonText: 'Learn more',
			},
			'card-cta',
		);
		expect(button?.action).toBe('Internal');
		expect(button?.text).toBe('Learn more');
		expect(button?._key).toBe('card-cta');
	});

	test('returns undefined when action is missing', () => {
		expect(normalizeRawCtaToButton({ field_buttonText: 'Learn more' }, 'card-cta')).toBeUndefined();
	});

	test('prefers GROQ action alias over field_ctaActionWithShared', () => {
		const button = normalizeRawCtaToButton(
			{
				action: 'SignUp',
				field_ctaActionWithShared: 'Internal',
				text: 'Sign up',
			},
			'card-cta',
		);
		expect(button?.action).toBe('SignUp');
	});

	test('preserves link and other ButtonType fields for transformButtons', () => {
		const button = normalizeRawCtaToButton(
			{
				action: 'Internal',
				text: 'Learn more',
				link: { href: '/candidates', title: 'Candidates', name: null },
			},
			'card-cta',
		);
		expect(button?.link?.href).toBe('/candidates');

		const transformed = button ? transformButtons([button])?.[0] : undefined;
		expect(transformed?.href).toBe('/candidates');
		expect(transformed?.label).toBe('Learn more');
	});
});

describe('resolveButtonHref', () => {
	test('treats empty string internal href as undefined', () => {
		const href = resolveButtonHref({
			action: 'Internal',
			link: { href: '' },
			_key: 'x',
		} as Parameters<typeof resolveButtonHref>[0]);
		expect(href).toBeUndefined();
	});

	test('returns internal link href when present', () => {
		const href = resolveButtonHref({
			action: 'Internal',
			link: { href: '/candidates' },
			_key: 'x',
		} as Parameters<typeof resolveButtonHref>[0]);
		expect(href).toBe('/candidates');
	});
});
