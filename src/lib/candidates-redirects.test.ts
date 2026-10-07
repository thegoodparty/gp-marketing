import { describe, expect, test } from 'bun:test';
import { candidatesPageRedirects } from './candidates-redirects';

/** Every candidate listing URL depth redirects permanently to its position page, and nothing else. */
describe('candidatesPageRedirects', () => {
	test('covers the four position page depths', () => {
		expect(candidatesPageRedirects.map(r => r.source)).toEqual([
			'/elections/:state/position/:positionSlug/candidates',
			'/elections/:state/:county/position/:positionSlug/candidates',
			'/elections/:state/:county/:city/position/:positionSlug/candidates',
			'/elections/:state/:county/:city/:subplace/position/:positionSlug/candidates',
		]);
	});

	test('sends each one to the position page it hangs off, permanently', () => {
		for (const rule of candidatesPageRedirects) {
			expect<string>(rule.destination).toBe(rule.source.replace(/\/candidates$/, ''));
			expect(rule.permanent).toBe(true);
		}
	});

	test('the parameters carry over, so a real URL keeps its place and office', () => {
		const rule = candidatesPageRedirects[2]!;
		const params = [...rule.source.matchAll(/:(\w+)/g)].map(m => m[1]);
		for (const name of params) expect(rule.destination).toContain(`:${name}`);
	});
});
