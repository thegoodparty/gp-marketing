import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { ElectionPositionResourcesBlock } from './ElectionPositionResourcesBlock.tsx';

const card = {
	label: 'Guide',
	title: 'How to Run for Mayor',
	description: 'A step-by-step guide.',
	icon: 'book-open',
	button: { buttonType: 'internal' as const, href: '/blog/article/how-to-run-for-mayor', label: 'Read the guide' },
};

describe('ElectionPositionResourcesBlock', () => {
	test('renders nothing at all with no cards', () => {
		expect(renderToStaticMarkup(<ElectionPositionResourcesBlock cards={[]} />)).toBe('');
	});

	test('renders the label, heading, description and button of a card', () => {
		const html = renderToStaticMarkup(<ElectionPositionResourcesBlock cards={[{ ...card, color: 'waxflower' }]} />);

		expect(html).toContain('Guide');
		expect(html).toContain('How to Run for Mayor');
		expect(html).toContain('A step-by-step guide.');
		expect(html).toContain('href="/blog/article/how-to-run-for-mayor"');
		expect(html).toContain('bg-waxflower-200');
		expect(html).toContain('bg-midnight-900');
	});

	test('a midnight card swaps the dark button for the outline one so it stays visible', () => {
		const html = renderToStaticMarkup(<ElectionPositionResourcesBlock cards={[{ ...card, color: 'midnight' }]} />);

		expect(html).toContain('border-white');
	});
});
