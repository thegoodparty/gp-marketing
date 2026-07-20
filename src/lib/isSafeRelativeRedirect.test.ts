import { describe, expect, it } from 'bun:test';
import { isSafeRelativeRedirect } from './isSafeRelativeRedirect';

describe('isSafeRelativeRedirect', () => {
	it('allows root-relative paths', () => {
		expect(isSafeRelativeRedirect('/thank-you')).toBe(true);
		expect(isSafeRelativeRedirect('/newsletter/confirm?ref=hero')).toBe(true);
	});

	it('blocks protocol-relative URLs', () => {
		expect(isSafeRelativeRedirect('//evil.com')).toBe(false);
	});

	it('blocks backslash open-redirect bypass', () => {
		expect(isSafeRelativeRedirect('/\\evil.com')).toBe(false);
	});

	it('blocks percent-encoded backslash open-redirect bypass', () => {
		expect(isSafeRelativeRedirect('/%5C%2Fevil.com')).toBe(false);
	});

	it('blocks absolute URLs', () => {
		expect(isSafeRelativeRedirect('https://evil.com')).toBe(false);
	});

	it('blocks double-encoded protocol-relative URL bypass', () => {
		expect(isSafeRelativeRedirect('/%252F%252Fevil.com')).toBe(false);
	});
});
