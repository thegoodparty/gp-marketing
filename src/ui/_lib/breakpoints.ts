/* Breakpoints that match with globals.css so that we can use them in JS consistently */
/* If changing these, make sure globals.css values also match */

export const breakpoints = /** @type {const} */ ({
	/* 360px */
	minXs: {
		query: '(min-width: 22.5rem)',
		pixel: 360,
	},
	/* 640px */
	minSm: {
		query: '(min-width: 40rem)',
		pixel: 640,
	},
	/* 768px */
	minMd: {
		query: '(min-width: 48rem)',
		pixel: 768,
	},
	/* 1024px */
	minLg: {
		query: '(min-width: 64rem)',
		pixel: 1024,
	},
	/* 1280px */
	minXl: {
		query: '(min-width: 80rem)',
		pixel: 1280,
	},
	/* 1536px */
	min2xl: {
		query: '(min-width: 96rem)',
		pixel: 1536,
	},
});
