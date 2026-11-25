import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArticleSummarySectionGroup } from './ArticleSummarySectionGroup';

/**
 * The article summary is the passage search and AI engines quote (wi-20261125-r08), so it has to
 * reach them as plain text: no heading tag for the label, no aside or complementary/note role.
 */

type Section = Parameters<typeof ArticleSummarySectionGroup>[0];

const section = (label?: string): Section =>
	({
		_type: 'articleSummary',
		_key: 'summary',
		field_label: label,
		block_summaryBody: [
			{
				_type: 'block',
				_key: 'b1',
				style: 'normal',
				markDefs: [{ _type: 'inlineExternalLink', _key: 'l1', field_externalLink: 'https://example.com' }],
				children: [
					{ _type: 'span', _key: 's1', text: 'First sentence of the answer. ', marks: [] },
					{ _type: 'span', _key: 's2', text: 'Bold part', marks: ['strong'] },
					{ _type: 'span', _key: 's3', text: ' and a link.', marks: ['l1'] },
				],
			},
		],
	}) as unknown as Section;

describe('article summary block', () => {
	test('renders the summary as real text inside a div', () => {
		const html = renderToStaticMarkup(<ArticleSummarySectionGroup {...section('Quick answer')} />);
		expect(html.startsWith('<div')).toBe(true);
		expect(html).toContain('First sentence of the answer.');
		expect(html).toContain('<strong>Bold part</strong>');
		expect(html).toContain('href="https://example.com"');
	});

	test('the label is a paragraph, never a heading, and nothing reads as a sidebar', () => {
		const html = renderToStaticMarkup(<ArticleSummarySectionGroup {...section('Quick answer')} />);
		expect(html).toMatch(/<p[^>]*>Quick answer<\/p>/);
		expect(html).not.toMatch(/<h[1-6][\s>]/);
		expect(html).not.toContain('<aside');
		expect(html).not.toMatch(/role="(complementary|note)"/);
		expect(html).not.toMatch(/display:\s*none|hidden/);
	});

	test('no label renders no label element', () => {
		const html = renderToStaticMarkup(<ArticleSummarySectionGroup {...section()} />);
		expect(html).not.toContain('uppercase');
		expect(html).toContain('First sentence of the answer.');
	});
});
