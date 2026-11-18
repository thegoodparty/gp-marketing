import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { Media } from './Media.tsx';

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

/**
 * The blog hero image sits in half the container from the large breakpoint up but
 * was served with the default `sizes="100vw"`, so desktop fetched a variant twice
 * the width it shows (SEO ticket wi-20261117-005). `Media` has to carry `sizes`
 * through to the image, and the image has to turn it into a media-query list that
 * still falls back to the full viewport on mobile.
 */
describe('ResponsiveImage sizes', () => {
	test('defaults to the full viewport', () => {
		expect(imageProps(ResponsiveImage({ image, alt: '' }))['sizes']).toBe('100vw');
	});

	test('caps a breakpoint and keeps the mobile fallback', () => {
		expect(imageProps(ResponsiveImage({ image, alt: '', sizes: { minLg: '50vw' } }))['sizes']).toBe('(min-width: 64rem) 50vw,100vw');
	});

	test('Media passes sizes through to the image', () => {
		const media = Media({ image: image as Parameters<typeof Media>[0]['image'], sizes: { minLg: '50vw' } }) as ReactElement<{
			children: [ReactElement<Record<string, unknown>>, unknown];
		}>;
		expect(media.props.children[0].props['sizes']).toEqual({ minLg: '50vw' });
	});
});
