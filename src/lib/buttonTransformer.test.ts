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

	test('accepts field_ctaAction alias', () => {
		expect(isButtonType({ field_ctaAction: 'External', _key: 'x' })).toBe(true);
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

	test('maps field_ctaAction to action and text', () => {
		const button = normalizeRawCtaToButton(
			{
				field_ctaAction: 'External',
				field_buttonText: 'Claim profile',
				field_externalLink: 'https://app.goodparty.org/sign-up',
			},
			'cand-banner-cta',
		);
		expect(button?.action).toBe('External');
		expect(button?.text).toBe('Claim profile');

		const transformed = button ? transformButtons([button])?.[0] : undefined;
		expect((transformed as { href?: string } | undefined)?.href).toBe('https://app.goodparty.org/sign-up');
		expect(transformed?.label).toBe('Claim profile');
	});

	test('prefers GROQ action alias over field_ctaAction', () => {
		const button = normalizeRawCtaToButton(
			{
				action: 'SignUp',
				field_ctaAction: 'Internal',
				text: 'Sign up',
			},
			'card-cta',
		);
		expect(button?.action).toBe('SignUp');
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
		expect((button?.link as { href?: string } | null | undefined)?.href).toBe('/candidates');

		const transformed = button ? transformButtons([button])?.[0] : undefined;
		expect((transformed as { href?: string } | undefined)?.href).toBe('/candidates');
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
		expect((transformed as { href?: string } | undefined)?.href).toBe('/candidates');
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

describe('transformButtons', () => {
	test('normalizes raw field_ctaAction payloads before transforming', () => {
		const transformed = transformButtons([
			{
				field_ctaAction: 'Internal',
				field_buttonText: 'Get free demo',
				link: { href: '/contact' },
			} as never,
		])?.[0];

		expect(transformed?.label).toBe('Get free demo');
		expect((transformed as { href?: string } | undefined)?.href).toBe('/contact');
	});
});
