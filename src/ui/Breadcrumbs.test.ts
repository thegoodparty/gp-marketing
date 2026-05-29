import { describe, expect, test } from 'bun:test';
import { getBreadcrumbItemKey, shouldRenderBreadcrumbLink } from './Breadcrumbs';

describe('shouldRenderBreadcrumbLink', () => {
	const crumbs = [
		{ href: '/', label: 'Home' },
		{ href: '/candidates', label: 'Candidates' },
		{ label: 'Jane Doe' },
	];

	test('last item without href is not a link', () => {
		expect(shouldRenderBreadcrumbLink(crumbs[2]!, 2, crumbs.length)).toBe(false);
	});

	test('middle item without href is not a link', () => {
		expect(shouldRenderBreadcrumbLink({ label: 'Missing href' }, 1, 3)).toBe(false);
	});

	test('middle item with href is a link', () => {
		expect(shouldRenderBreadcrumbLink(crumbs[1]!, 1, crumbs.length)).toBe(true);
	});

	test('empty string href is treated as non-link', () => {
		expect(shouldRenderBreadcrumbLink({ href: '', label: 'Current' }, 1, 3)).toBe(false);
	});
});

describe('getBreadcrumbItemKey', () => {
	test('uses stable id when provided', () => {
		expect(getBreadcrumbItemKey({ id: 'current-page', label: 'Jane Doe' }, 2)).toBe('current-page');
	});

	test('duplicate labels at different indices produce different keys', () => {
		const keyA = getBreadcrumbItemKey({ href: '/a', label: 'Home' }, 0);
		const keyB = getBreadcrumbItemKey({ href: '/b', label: 'Home' }, 1);
		expect(keyA).not.toBe(keyB);
	});

	test('omitted href uses current segment in generated key', () => {
		expect(getBreadcrumbItemKey({ label: 'Jane Doe' }, 2)).toBe('2-current-Jane Doe');
	});
});
