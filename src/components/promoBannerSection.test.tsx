import { describe, expect, test } from 'bun:test';
import { renderToString } from 'react-dom/server';

import { PromoBannerSection } from './PromoBannerSection';
import type { NavigationData } from './navigationData';

const navigationWith = (promoBanner: Partial<NonNullable<NonNullable<NavigationData>['promoBanner']>>): NavigationData =>
	({
		navigationList: null,
		primaryCTA: null,
		secondaryCTA: null,
		promoBanner: {
			field_enabled: true,
			field_text: 'Filing opens soon',
			field_color: 'Lavender',
			field_countdownTo: null,
			field_countdownLabel: null,
			field_startsAt: null,
			field_endsAt: null,
			list_includePaths: null,
			list_excludePaths: null,
			button: null,
			...promoBanner,
		},
	}) as NavigationData;

describe('PromoBannerSection', () => {
	test('renders nothing until the banner is switched on with some text', () => {
		expect(renderToString(<PromoBannerSection navigation={null} />)).toBe('');
		expect(renderToString(<PromoBannerSection navigation={navigationWith({ field_enabled: false })} />)).toBe('');
		expect(renderToString(<PromoBannerSection navigation={navigationWith({ field_text: '   ' })} />)).toBe('');
	});

	test('maps the Studio colour and renders the message with its dismiss key', () => {
		const html = renderToString(<PromoBannerSection navigation={navigationWith({})} />);
		expect(html).toContain('Filing opens soon');
		expect(html).toContain('bg-lavender-100');
		expect(html).toMatch(/data-promo-banner="[0-9a-z]+"/);
	});

	test('no colour chosen falls back to bright yellow', () => {
		expect(renderToString(<PromoBannerSection navigation={navigationWith({ field_color: null })} />)).toContain('bg-bright-yellow-100');
	});
});
