import { describe, expect, test } from 'bun:test';
import { normalizeVideoEmbed } from './normalizeVideoEmbed';

describe('normalizeVideoEmbed', () => {
	test('returns null for empty input', () => {
		expect(normalizeVideoEmbed('')).toBeNull();
		expect(normalizeVideoEmbed('   ')).toBeNull();
	});

	test('passes through full iframe HTML', () => {
		const iframe =
			'<iframe width="560" height="315" src="https://www.youtube.com/embed/abc123" title="YouTube video player"></iframe>';
		expect(normalizeVideoEmbed(iframe)).toBe(iframe);
	});

	test('wraps YouTube embed URL', () => {
		const result = normalizeVideoEmbed('https://www.youtube.com/embed/abc123?si=xyz');
		expect(result).toContain('src="https://www.youtube.com/embed/abc123?si=xyz"');
		expect(result).toContain('<iframe');
	});

	test('converts YouTube watch URL to embed iframe', () => {
		const result = normalizeVideoEmbed('https://www.youtube.com/watch?v=abc123');
		expect(result).toContain('src="https://www.youtube.com/embed/abc123"');
	});

	test('converts youtu.be short link to embed iframe', () => {
		const result = normalizeVideoEmbed('https://youtu.be/abc123?t=12');
		expect(result).toContain('src="https://www.youtube.com/embed/abc123?t=12"');
	});

	test('converts Vimeo page URL to player iframe', () => {
		const result = normalizeVideoEmbed('https://vimeo.com/123456789?h=abc');
		expect(result).toContain('src="https://player.vimeo.com/video/123456789?h=abc"');
	});

	test('wraps Vimeo player URL', () => {
		const result = normalizeVideoEmbed('https://player.vimeo.com/video/123456789');
		expect(result).toContain('src="https://player.vimeo.com/video/123456789"');
	});

	test('returns null for unsupported URLs', () => {
		expect(normalizeVideoEmbed('https://example.com/video')).toBeNull();
		expect(normalizeVideoEmbed('https://notyoutube.com/watch?v=abc123')).toBeNull();
	});
});
