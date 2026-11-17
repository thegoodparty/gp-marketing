import { describe, expect, it } from 'bun:test';
import { retiredDdhqAnswer } from './people-retired-ddhq';
import { RETIRED_DDHQ_GONE, RETIRED_DDHQ_REDIRECTS } from './people-retired-ddhq.data';

describe('retiredDdhqAnswer', () => {
	it('forwards a retired profile with a matched race to the old-app office route', () => {
		expect(retiredDdhqAnswer('/people/demitri-theodoropoulos-259b578a')).toEqual({
			kind: 'redirect',
			destination: '/elections/position/de/newark/city-legislature',
		});
	});

	it('answers gone for a retired profile with no successor', () => {
		expect(retiredDdhqAnswer('/people/vinnie-royster-cf77a7fd')).toEqual({ kind: 'gone' });
	});

	it('ignores trailing slashes and letter case', () => {
		expect(retiredDdhqAnswer('/people/Vinnie-Royster-CF77A7FD/')).toEqual({ kind: 'gone' });
	});

	it('leaves every other /people URL to the route', () => {
		expect(retiredDdhqAnswer('/people/jane-doe-11111111')).toBeNull();
		expect(retiredDdhqAnswer('/people/')).toBeNull();
		expect(retiredDdhqAnswer('/people')).toBeNull();
	});

	it('does not match on the id suffix alone, so a live profile sharing a suffix is untouched', () => {
		expect(retiredDdhqAnswer('/people/someone-else-cf77a7fd')).toBeNull();
		expect(retiredDdhqAnswer('/people/someone-else-259b578a')).toBeNull();
	});

	it('ignores nested paths and other routes', () => {
		expect(retiredDdhqAnswer('/people/vinnie-royster-cf77a7fd/extra')).toBeNull();
		expect(retiredDdhqAnswer('/candidate/vinnie-royster-cf77a7fd')).toBeNull();
		expect(retiredDdhqAnswer('/')).toBeNull();
	});
});

describe('the generated map', () => {
	it('holds every slug once, in the <base>-<id8> shape, with no slug in both lists', () => {
		const gone = RETIRED_DDHQ_GONE.split('\n').filter(Boolean);
		const redirects = Object.keys(RETIRED_DDHQ_REDIRECTS);
		const all = [...gone, ...redirects];
		expect(new Set(all).size).toBe(all.length);
		for (const slug of all) expect(slug).toMatch(/^[a-z0-9-]*[0-9a-f]{8}$/);
	});

	it('only forwards to race slugs the old-app office route accepts (state plus one to four segments)', () => {
		for (const raceSlug of Object.values(RETIRED_DDHQ_REDIRECTS)) {
			const segments = raceSlug.split('/');
			expect(segments.length).toBeGreaterThanOrEqual(2);
			expect(segments.length).toBeLessThanOrEqual(5);
			expect(segments[0]).toMatch(/^[a-z]{2}$/);
		}
	});
});
