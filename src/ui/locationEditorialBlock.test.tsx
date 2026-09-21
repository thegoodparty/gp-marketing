import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationEditorialBlock } from './LocationEditorialBlock.tsx';

/**
 * The editorial paragraphs arrive per page at runtime, so on any page whose
 * route supplies none this block has a heading and nothing to say. A heading
 * over an empty white card is the "renders as nothing, but visibly" failure the
 * redesign doc warns about, and an error boundary would not catch it because
 * nothing throws. So the whole section has to disappear instead.
 */
describe('LocationEditorialBlock', () => {
	test('renders nothing when there is no copy', () => {
		const html = renderToStaticMarkup(<LocationEditorialBlock heading='More about Tucson' />);

		expect(html).toBe('');
	});

	test('renders nothing when the copy is an empty list of paragraphs', () => {
		const html = renderToStaticMarkup(<LocationEditorialBlock heading='More about Tucson' copy={[]} />);

		expect(html).toBe('');
	});

	test('renders the heading and the copy when the page supplies paragraphs', () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlock heading='More about Tucson' copy={[<p key='0'>Council seats are elected by ward.</p>]} />,
		);

		expect(html).toContain('More about Tucson');
		expect(html).toContain('Council seats are elected by ward.');
	});

	test('keeps the lavender rule beside the copy', () => {
		const html = renderToStaticMarkup(<LocationEditorialBlock copy={[<p key='0'>Body</p>]} />);

		expect(html).toContain('border-lavender-200');
	});

	test('inverts the heading on a midnight background', () => {
		const html = renderToStaticMarkup(
			<LocationEditorialBlock backgroundColor='midnight' heading='More about Tucson' copy={[<p key='0'>Body</p>]} />,
		);

		expect(html).toContain('bg-midnight-900');
		expect(html).toContain('text-white');
	});
});
