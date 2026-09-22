import { describe, expect, test } from 'bun:test';

import { buildElectionsIndexTokens } from '~/lib/electionsIndexTemplates';
import { buildElectionsIndexSectionOverrides } from '~/lib/electionsTemplateHelpers';
import { resolveTokens } from '~/lib/resolveTokens';

const baseCtx = {
	breadcrumbs: [{ href: '/elections', label: 'Elections' }],
	stateName: 'Arizona',
};

describe('buildElectionsIndexTokens', () => {
	test('[location] is the state on a state page', () => {
		const tokens = buildElectionsIndexTokens({ locationLevel: 'state', stateName: 'Arizona' });

		expect(resolveTokens('More about [location]', tokens)).toBe('More about Arizona');
	});

	test('[location] is the county on a county page', () => {
		const tokens = buildElectionsIndexTokens({
			locationLevel: 'county',
			stateName: 'Arizona',
			countyName: 'Pima County',
		});

		expect(resolveTokens('More about [location]', tokens)).toBe('More about Pima County');
	});

	test('[location] is the city on a city page', () => {
		const tokens = buildElectionsIndexTokens({
			locationLevel: 'city',
			stateName: 'Arizona',
			countyName: 'Pima County',
			cityName: 'Tucson',
		});

		expect(resolveTokens('More about [location]', tokens)).toBe('More about Tucson');
	});

	// District pages carry the district's own name in `countyName`, which is what
	// `[District]` reads, so `[location]` has to resolve to it too rather than
	// falling back to the state.
	test('[location] is the district on a district page', () => {
		const tokens = buildElectionsIndexTokens({
			locationLevel: 'district',
			stateName: 'Arizona',
			countyName: 'Tucson Unified School District',
		});

		expect(resolveTokens('More about [location]', tokens)).toBe('More about Tucson Unified School District');
	});
});

describe('buildElectionsIndexSectionOverrides', () => {
	test('passes the editorial paragraphs through when the page supplies them', () => {
		const overrides = buildElectionsIndexSectionOverrides({
			...baseCtx,
			locationLevel: 'state',
			locationEditorial: { heading: 'More about Arizona', paragraphs: ['First.', 'Second.'] },
		});

		expect(overrides.component_locationEditorialBlock).toEqual({
			heading: 'More about Arizona',
			paragraphs: ['First.', 'Second.'],
		});
	});

	test('omits the editorial override when the page supplies none', () => {
		const overrides = buildElectionsIndexSectionOverrides({ ...baseCtx, locationLevel: 'state' });

		expect(overrides.component_locationEditorialBlock).toBeUndefined();
	});
});
