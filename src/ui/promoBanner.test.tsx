import { describe, expect, test } from 'bun:test';
import { renderToString } from 'react-dom/server';

import { PromoBanner } from './PromoBanner';

/**
 * Server render only. Outside Next there is no pathname context, so the banner sees "/";
 * the URL rules themselves are covered in `~/lib/promoBanner.test.ts`.
 */
describe('PromoBanner', () => {
	test('renders the message, the small button, the dismiss control and the pre-paint script', () => {
		const html = renderToString(
			<PromoBanner
				text='Filing opens soon'
				button={{ buttonType: 'internal', href: '/run-for-office', label: 'Get started' }}
				dismissKey='k1'
				endsAt='2030-01-01T00:00:00Z'
			/>,
		);
		expect(html).toContain('data-component="PromoBanner"');
		expect(html).toContain('Filing opens soon');
		expect(html).toContain('href="/run-for-office"');
		expect(html).toContain('Get started');
		expect(html).toContain('aria-label="Dismiss this message"');
		expect(html).toContain('<script>');
		expect(html).toContain('"k1"');
		expect(html).toContain(`n>=${Date.parse('2030-01-01T00:00:00Z')}`);
	});

	test('renders nothing when the URL rules exclude the page', () => {
		expect(renderToString(<PromoBanner text='Hidden here' dismissKey='k2' excludePaths={['/']} />)).toBe('');
		expect(renderToString(<PromoBanner text='Hidden here' dismissKey='k2' includePaths={['/blog/']} />)).toBe('');
	});

	test('still renders when the schedule has ended, leaving the browser to hide it', () => {
		const html = renderToString(<PromoBanner text='Old promo' dismissKey='k3' endsAt='2000-01-01T00:00:00Z' />);
		expect(html).toContain('Old promo');
		expect(html).toContain('data-promo-banner="k3"');
		expect(html).toContain('{display:none}');
	});
});
