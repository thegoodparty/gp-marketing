/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { LOGROCKET_SAMPLE_RATE, isSampledForLogRocket } from './logrocketSampling';

const memoryStorage = () => {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
	};
};

const throwingStorage = () => ({
	getItem: (): string | null => {
		throw new Error('blocked');
	},
	setItem: () => {
		throw new Error('blocked');
	},
});

describe('isSampledForLogRocket', () => {
	test('records a visit whose roll falls under the sample rate', () => {
		const storage = memoryStorage();
		expect(isSampledForLogRocket(() => storage, () => LOGROCKET_SAMPLE_RATE / 2)).toBe(true);
	});

	test('skips a visit whose roll is at or over the sample rate', () => {
		expect(isSampledForLogRocket(() => memoryStorage(), () => LOGROCKET_SAMPLE_RATE)).toBe(false);
		expect(isSampledForLogRocket(() => memoryStorage(), () => 0.99)).toBe(false);
	});

	test('keeps the first decision for the rest of the tab session', () => {
		const sampledIn = memoryStorage();
		isSampledForLogRocket(() => sampledIn, () => 0);
		expect(isSampledForLogRocket(() => sampledIn, () => 0.99)).toBe(true);

		const sampledOut = memoryStorage();
		isSampledForLogRocket(() => sampledOut, () => 0.99);
		expect(isSampledForLogRocket(() => sampledOut, () => 0)).toBe(false);
	});

	test('still decides when storage is blocked', () => {
		expect(isSampledForLogRocket(throwingStorage, () => 0)).toBe(true);
		expect(isSampledForLogRocket(throwingStorage, () => 0.99)).toBe(false);
	});

	test('records roughly the sample rate across many visits', () => {
		let recorded = 0;
		for (let i = 0; i < 10_000; i++) {
			if (isSampledForLogRocket(() => memoryStorage(), () => i / 10_000)) recorded++;
		}
		expect(recorded).toBe(Math.round(10_000 * LOGROCKET_SAMPLE_RATE));
	});
});
