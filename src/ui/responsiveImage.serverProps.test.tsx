import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { ResponsiveImage } from './ResponsiveImage.tsx';

/**
 * Most blocks render on the server, and React refuses to hand a function prop
 * from a server component to next/image ("Event handlers cannot be passed to
 * Client Component props"). The illustrated columns block hit exactly that on
 * every location page (Emily, 2026-10-07), so the load handler is only attached
 * when a caller asks to be told about loading.
 */
type ImageProp = Parameters<typeof ResponsiveImage>[0]['image'];
const image = { _type: 'image', asset: { _type: 'reference', _ref: 'image-abc123def456abc123def456abc123def456abc1-108x112-png' } } as unknown as ImageProp;

function imageProps(element: ReactElement | null): Record<string, unknown> {
	const wrapper = element as ReactElement<{ children: ReactElement<Record<string, unknown>> }> | null;
	if (!wrapper) throw new Error('expected the image to render');
	return wrapper.props.children.props;
}

describe('ResponsiveImage server props', () => {
	test('passes no load handler when nobody listens for it', () => {
		expect(imageProps(ResponsiveImage({ image, alt: '' }))).not.toHaveProperty('onLoad', expect.any(Function));
	});

	test('still reports loading to a caller that asked', () => {
		const props = imageProps(ResponsiveImage({ image, alt: '', setImageLoaded: () => undefined }));
		expect(typeof props['onLoad']).toBe('function');
	});
});
