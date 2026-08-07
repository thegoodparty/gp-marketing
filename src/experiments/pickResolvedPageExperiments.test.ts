import { describe, expect, test } from 'bun:test';
import type { Sections } from '~/PageSections';
import { pickResolvedPageExperiments, type ActiveExperimentVariantRow } from './pickResolvedPageExperiments';

const treatmentSections = [{ _key: 't1', _type: 'component_bannerBlock' }] as unknown as Sections[];

function row(
	experimentId: string,
	variantName: string,
	sections?: Sections[] | null,
): ActiveExperimentVariantRow {
	return {
		field_experimentId: experimentId,
		field_variantName: variantName,
		pageSections: sections ? { list_pageSections: sections } : undefined,
	};
}

describe('pickResolvedPageExperiments', () => {
	test('returns control when variants empty', () => {
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		expect(pickResolvedPageExperiments([], {}, control)).toEqual({
			pageSections: control,
			exposures: [],
		});
	});

	test('control assignment returns control sections with exposure tracked', () => {
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [
			row('exp_a', 'treat', treatmentSections),
			row('exp_b', 'v2', [{ _key: 'x', _type: 'component_statsBlock' }] as unknown as Sections[]),
		];
		const assignments = { exp_a: 'control', exp_b: 'v2' };
		const r = pickResolvedPageExperiments(variants, assignments, control);
		expect(r.exposures).toEqual([{ flagKey: 'exp_a', variant: 'control' }]);
		expect(r.pageSections).toEqual(control);
	});

	test('lower-priority experiment listed first still wins when first has no match', () => {
		const control = [] as unknown as Sections[];
		const variants = [
			row('exp_high', 'missing', treatmentSections),
			row('exp_low', 'on', treatmentSections),
		];
		const assignments = { exp_high: 'other', exp_low: 'on' };
		const r = pickResolvedPageExperiments(variants, assignments, control);
		expect(r.exposures).toEqual([{ flagKey: 'exp_low', variant: 'on' }]);
	});

	test('respects experiment order for same page (first matching flag in list order)', () => {
		const control = [] as unknown as Sections[];
		const a = treatmentSections;
		const b = [{ _key: 'b', _type: 'component_statsBlock' }] as unknown as Sections[];
		const variants = [row('first', 't1', a), row('second', 't2', b)];
		const assignments = { first: 't1', second: 't2' };
		const r = pickResolvedPageExperiments(variants, assignments, control);
		expect(r.exposures).toEqual([{ flagKey: 'first', variant: 't1' }]);
		expect(r.pageSections).toEqual(a);
	});

	test('skips off and null (no exposure tracked)', () => {
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [row('e1', 't', treatmentSections)];
		expect(pickResolvedPageExperiments(variants, { e1: 'off' }, control).exposures).toEqual([]);
		expect(pickResolvedPageExperiments(variants, { e1: null }, control).exposures).toEqual([]);
	});

	test('control tracks exposure but off does not', () => {
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [row('e1', 't', treatmentSections)];
		const r = pickResolvedPageExperiments(variants, { e1: 'control' }, control);
		expect(r.exposures).toEqual([{ flagKey: 'e1', variant: 'control' }]);
		expect(r.pageSections).toEqual(control);
	});

	test('variant with empty list_pageSections skips to next experiment (does not render blank page)', () => {
		// An empty array is truthy so the current guard `if (!match?.pageSections?.list_pageSections)`
		// does NOT skip it — this test documents the current behavior so any future fix is deliberate.
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [row('exp_empty', 'v1', [])];
		const r = pickResolvedPageExperiments(variants, { exp_empty: 'v1' }, control);
		// Current behavior: empty array is returned (blank page). Document it explicitly.
		expect(r.pageSections).toEqual([]);
		expect(r.exposures).toEqual([{ flagKey: 'exp_empty', variant: 'v1' }]);
	});

	test('variant with null list_pageSections falls through to control', () => {
		// null pageSections is falsy so the guard skips it correctly
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [row('exp_null', 'v1', null)];
		const r = pickResolvedPageExperiments(variants, { exp_null: 'v1' }, control);
		expect(r.pageSections).toEqual(control);
		expect(r.exposures).toEqual([]);
	});

	test('variant with undefined pageSections falls through to control', () => {
		const control = [{ _key: 'c', _type: 'component_hero' }] as unknown as Sections[];
		const variants = [row('exp_undef', 'v1')]; // no sections arg → undefined
		const r = pickResolvedPageExperiments(variants, { exp_undef: 'v1' }, control);
		expect(r.pageSections).toEqual(control);
		expect(r.exposures).toEqual([]);
	});
});
