import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Breadcrumbs, isCollapsedBreadcrumb } from './Breadcrumbs';

/**
 * Pins the Voter Guide phone treatment (Emily, 2026-10-06): first crumb, "...",
 * last crumb, the middle folded away below `md` but still in the DOM, and
 * nothing of the sort unless a caller asks for it.
 */

const TRAIL = [
	{ href: '/elections', label: 'Elections' },
	{ href: '/elections/mn', label: 'Minnesota' },
	{ href: '/elections/mn/hennepin-county', label: 'Hennepin County' },
	{ href: '/elections/mn/hennepin-county/minneapolis/position/city-council', label: 'City Council' },
	{ label: 'DeVelle Jackson' },
];

function render(items: typeof TRAIL, collapseOnMobile?: boolean): string {
	return renderToStaticMarkup(<Breadcrumbs items={items} collapseOnMobile={collapseOnMobile} />);
}

/** The fold wrapper around a crumb, by the crumb's label: the nearest `contents` span before it. */
function wrapperClass(html: string, label: string): string {
	const at = html.indexOf(`>${label}<`);
	expect(at).toBeGreaterThan(-1);
	const before = html.slice(0, at);
	const classes = [...before.matchAll(/<span class="((?:hidden )?(?:md:)?contents)"/g)].map(m => m[1] ?? '');
	return classes.at(-1) ?? '';
}

describe('the Voter Guide phone treatment', () => {
	test('folds the middle crumbs below md and keeps them in the DOM', () => {
		const html = render(TRAIL, true);
		expect(wrapperClass(html, 'Elections')).toBe('contents');
		expect(wrapperClass(html, 'DeVelle Jackson')).toBe('contents');
		for (const label of ['Minnesota', 'Hennepin County', 'City Council']) {
			expect(wrapperClass(html, label)).toBe('hidden md:contents');
			// Still a real link for crawlers and for the expanded state.
			expect(html).toContain(`>${label}</a>`);
		}
	});

	test('puts a "..." button between the first and last crumb, phone only', () => {
		const html = render(TRAIL, true);
		const dots = html.indexOf('>...</button>');
		expect(dots).toBeGreaterThan(html.indexOf('>Elections<'));
		expect(dots).toBeLessThan(html.indexOf('>Minnesota<'));
		expect(html).toContain('aria-expanded="false"');
		expect(html).toMatch(/<button[^>]*class="[^"]*md:hidden/);
	});

	test('a two-crumb trail has nothing to fold', () => {
		const html = render(TRAIL.slice(0, 2), true);
		expect(html).not.toContain('>...</button>');
		expect(html).not.toContain('hidden md:contents');
		expect(isCollapsedBreadcrumb(1, 2)).toBe(false);
		expect(isCollapsedBreadcrumb(1, 3)).toBe(true);
		expect(isCollapsedBreadcrumb(0, 3)).toBe(false);
		expect(isCollapsedBreadcrumb(2, 3)).toBe(false);
	});

	test('is off unless asked for, so the blog and glossary trails are untouched', () => {
		const html = render(TRAIL);
		expect(html).not.toContain('>...</button>');
		expect(html).not.toContain('hidden md:contents');
		expect(html).not.toContain('max-md:');
	});

	test('applies the frames’ phone sizes only with the treatment', () => {
		expect(render(TRAIL, true)).toContain('max-md:text-[0.875rem]/[1.25rem]');
		expect(render(TRAIL, true)).toContain('max-md:w-[15px]');
	});
});
