import localFont from 'next/font/local';
import './fonts.css';

/**
 * Self-hosted copies of the Google Fonts files the site used, so a build never
 * downloads fonts: next/font/google fails the build whenever Google hands back
 * a font URL without a file extension (vercel/next.js#99114).
 *
 * Only the latin files load here, so only they are preloaded, as
 * `subsets: ['latin']` did. The other scripts' files are in fonts.css, under
 * the family named after this one in `fallback`. Turbopack drops next/font/local
 * `declarations`, so those faces cannot carry their `unicode-range` from here.
 */
export const primaryFont = localFont({
	src: [
		{ path: './outfit/outfit-latin.woff2', weight: '400', style: 'normal' },
		{ path: './outfit/outfit-latin.woff2', weight: '600', style: 'normal' },
	],
	display: 'swap',
	preload: true,
	variable: '--font-primary',
	adjustFontFallback: false,
	fallback: ['Outfit', 'Outfit Fallback'],
});

export const secondaryFont = localFont({
	src: [
		{ path: './open-sans/open-sans-latin.woff2', weight: '400', style: 'normal' },
		{ path: './open-sans/open-sans-latin.woff2', weight: '600', style: 'normal' },
	],
	display: 'swap',
	preload: true,
	variable: '--font-secondary',
	adjustFontFallback: false,
	fallback: ['Open Sans', 'Open Sans Fallback'],
});
