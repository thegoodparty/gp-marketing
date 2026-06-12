import { describe, expect, test } from 'bun:test';
import {
	isButtonType,
	isUsableHref,
	normalizeRawCtaToButton,
	resolveButtonHref,
	transformButton,
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

	test('static mock shape with field_ctaActionWithShared only produces a button', () => {
		const button = normalizeRawCtaToButton(
			{
				field_ctaActionWithShared: 'Internal',
				field_buttonText: 'Learn more',
				link: { href: '/candidates' },
			},
			'pledge-cta',
		);
		expect(button?.action).toBe('Internal');

		const transformed = button ? transformButtons([button])?.[0] : undefined;
		expect(transformed?.href).toBe('/candidates');
		expect(transformed?.label).toBe('Learn more');
	});
});

describe('isUsableHref', () => {
	test('rejects undefined and empty string', () => {
		expect(isUsableHref(undefined)).toBe(false);
		expect(isUsableHref('')).toBe(false);
	});

	test('accepts non-empty href', () => {
		expect(isUsableHref('/candidates')).toBe(true);
	});
});

describe('resolveButtonHref', () => {
	test('preserves empty string internal href', () => {
		const href = resolveButtonHref({
			action: 'Internal',
			link: { href: '' },
			_key: 'x',
		} as Parameters<typeof resolveButtonHref>[0]);
		expect(href).toBe('');
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

describe('transformButton', () => {
	test('returns undefined when internal href is empty', () => {
		const result = transformButton({
			action: 'Internal',
			link: { href: '' },
			text: 'Learn more',
			_key: 'x',
		} as Parameters<typeof transformButton>[0]);
		expect(result).toBeUndefined();
	});

	test('returns undefined when normalizeRawCtaToButton yields empty link href', () => {
		const button = normalizeRawCtaToButton(
			{
				action: 'Internal',
				text: 'Learn more',
				link: { href: '' },
			},
			'card-cta',
		);
		expect(button).toBeDefined();
		expect(transformButton(button!)).toBeUndefined();
	});
});

describe('transformButton — External action', () => {
	test('returns external button when externalLink is set', () => {
		const result = transformButton({
			action: 'External',
			field_externalLink: 'https://example.com',
			text: 'Visit',
			_key: 'ext-1',
		} as Parameters<typeof transformButton>[0]);
		expect(result?.buttonType).toBe('external');
		expect(result?.href).toBe('https://example.com');
		expect(result?.label).toBe('Visit');
	});

	test('returns undefined when externalLink is absent', () => {
		// guards against rendering a broken <a> with no href
		const result = transformButton({
			action: 'External',
			text: 'Visit',
			_key: 'ext-2',
		} as Parameters<typeof transformButton>[0]);
		expect(result).toBeUndefined();
	});
});

describe('transformButton — Anchor action', () => {
	test('returns anchor button when anchor is set', () => {
		const result = transformButton({
			action: 'Anchor',
			anchor: '#section-id',
			text: 'Jump',
			_key: 'anc-1',
		} as Parameters<typeof transformButton>[0]);
		expect(result?.buttonType).toBe('anchor');
		expect(result?.href).toBe('#section-id');
	});

	test('returns undefined when anchor is absent', () => {
		const result = transformButton({
			action: 'Anchor',
			text: 'Jump',
			_key: 'anc-2',
		} as Parameters<typeof transformButton>[0]);
		expect(result).toBeUndefined();
	});
});

describe('transformButton — LogIn and SignUp actions', () => {
	test('LogIn returns hardcoded goodparty login URL', () => {
		// guards against the href accidentally becoming undefined if env changes
		const result = transformButton({
			action: 'LogIn',
			_key: 'login-1',
		} as Parameters<typeof transformButton>[0]);
		expect(result?.buttonType).toBe('external');
		expect(result?.href).toBe('https://app.goodparty.org/login');
		expect(result?.label).toBe('Login');
	});

	test('LogIn uses custom text when provided', () => {
		const result = transformButton({
			action: 'LogIn',
			text: 'Log in to your account',
			_key: 'login-2',
		} as Parameters<typeof transformButton>[0]);
		expect(result?.label).toBe('Log in to your account');
	});

	test('SignUp returns hardcoded goodparty sign-up URL', () => {
		const result = transformButton({
			action: 'SignUp',
			_key: 'signup-1',
		} as Parameters<typeof transformButton>[0]);
		expect(result?.buttonType).toBe('external');
		expect(result?.href).toBe('https://app.goodparty.org/sign-up');
		expect(result?.label).toBe('Sign up');
	});
});

describe('transformButtons — collection helpers', () => {
	test('filters out null entries without throwing', () => {
		const buttons = [null, { action: 'LogIn', _key: 'k1' }] as Parameters<typeof transformButtons>[0];
		const result = transformButtons(buttons);
		expect(result).toHaveLength(1);
		expect(result?.[0]?.href).toBe('https://app.goodparty.org/login');
	});

	test('returns undefined for undefined input', () => {
		expect(transformButtons(undefined)).toBeUndefined();
	});

	test('returns empty array when all buttons produce no href', () => {
		const buttons = [
			{ action: 'Internal', link: { href: '' }, text: 'x', _key: 'k1' },
			{ action: 'External', text: 'y', _key: 'k2' },
		] as Parameters<typeof transformButtons>[0];
		expect(transformButtons(buttons)).toEqual([]);
	});
});
