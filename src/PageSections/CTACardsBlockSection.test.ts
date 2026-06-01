import { describe, expect, test } from 'bun:test';
import { resolveCtaCardHref } from './CTACardsBlockSection';

describe('resolveCtaCardHref', () => {
	test('uses label fallback when internal href is empty', () => {
		const href = resolveCtaCardHref(
			{
				action: 'Internal',
				link: { href: '' },
				_key: 'x',
			},
			{ label: 'Candidates', href: '/candidates' },
		);
		expect(href).toBe('/candidates');
	});

	test('returns resolved href when present', () => {
		const href = resolveCtaCardHref(
			{
				action: 'Internal',
				link: { href: '/blog' },
				_key: 'x',
			},
			{ label: 'Candidates', href: '/candidates' },
		);
		expect(href).toBe('/blog');
	});

	test('returns undefined when no href and no fallback', () => {
		expect(resolveCtaCardHref({ action: 'Internal', link: { href: '' }, _key: 'x' })).toBeUndefined();
	});

	test('uses label fallback for static mock shape without GROQ action alias', () => {
		const href = resolveCtaCardHref(
			{
				field_ctaActionWithShared: 'Internal',
				field_buttonText: 'Explore candidates running near you',
				text: 'Explore candidates running near you',
			},
			{ label: 'Candidates', href: '/candidates' },
		);
		expect(href).toBe('/candidates');
	});
});
