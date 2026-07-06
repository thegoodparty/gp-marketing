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

	it('blocks absolute URLs', () => {
		expect(isSafeRelativeRedirect('https://evil.com')).toBe(false);
	});
});
