'use client';
import { type RefObject, useEffect, useState } from 'react';

/**
 * Custom hook to track the position and size of a DOM element
 * @param {React.RefObject<HTMLElement>} track Optional ref to the HTML element to track
 * @returns {Rect} Object containing information about the position and size of the tracked element
 */

function useRectTracker(track?: RefObject<HTMLElement | null>): Rect {
	const [reactiveRect, setReactiveRect] = useState<Rect>({ ...setRect(track) });

	useEffect(() => {
		const onResize = () => {
			setReactiveRect({ ...setRect(track) });
		};
		onResize();
		window.addEventListener('resize', onResize);
		if (!document.body) return;
		const resizeObserver = new ResizeObserver(() => {
			setReactiveRect({ ...setRect(track) });
		});
		resizeObserver.observe(document.body);
		return () => {
			window.removeEventListener('resize', onResize);
			resizeObserver.disconnect();
		};
	}, []);

	return {
		...reactiveRect, // Dom rect
	};
}

export function setRect(track: RefObject<HTMLElement | null> | undefined) {
	const rect = {
		left: 0,
		top: 0,
		bottom: 0,
		width: 0,
		height: 0,
		computedStyle: {
			paddingTop: 0,
			paddingRight: 0,
			paddingBottom: 0,
			paddingLeft: 0,
			marginTop: 0,
			marginRight: 0,
			marginBottom: 0,
			marginLeft: 0,
			gap: 0,
			fontSize: 0,
		},
		topOffset: 0,
		leftOffset: 0,
		windowWidth: 0,
		windowHeight: 0,
		maxScrollXDistance: 0,
		maxScrollYDistance: 0,
		isSafari: false,
	};

	const _rect = track?.current?.getBoundingClientRect();
	if (_rect && track?.current) {
		rect.left = _rect.left;
		rect.top = _rect.top;
		rect.bottom = _rect.bottom;
		rect.width = _rect.width;
		rect.height = _rect.height;
		rect.topOffset = getTopOffset(track.current);
		rect.leftOffset = getLeftOffset(track.current);
		const computedStyle = getParentComputedStyle(track.current);
		if (computedStyle) {
			rect.computedStyle = computedStyle;
		}
	}
	if (typeof window !== 'undefined' && 'navigator' in window) {
		rect.windowWidth = window.innerWidth;
		rect.windowHeight = window.innerHeight;
		rect.maxScrollXDistance = document.body.clientWidth - window?.innerWidth;
		rect.maxScrollYDistance = document.body.clientHeight - window?.innerHeight;
	}

	if (typeof window !== 'undefined' && 'navigator' in window) {
		rect.isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
	}

	return rect;
}

/**
 * Calculates the top offset of the given HTML element
 * @param element The HTML element to calculate the top offset for
 * @returns The top offset of the element
 */
export function getTopOffset(element: HTMLElement | null) {
	if (!element) {
		return 0;
	}

	let coords = 0;
	while (element) {
		coords += element.offsetTop;
		element = element.offsetParent as HTMLElement;
	}
	return coords;
}

/**
 * Calculates the left offset of the given HTML element
 * @param element The HTML element to calculate the left offset for
 * @returns The left offset of the element
 */
export function getLeftOffset(element: HTMLElement | null) {
	if (!element) {
		return 0;
	}

	let coords = 0;
	while (element) {
		coords += element.offsetLeft;
		element = element.offsetParent as HTMLElement;
	}
	return coords;
}

/**
 * Retrieves the computed style of the given HTML element
 * @param element The HTML element to retrieve the computed style for
 * @returns Object containing computed style properties such as padding, margin, gap, and font size
 */
export function getParentComputedStyle(element: HTMLElement) {
	const styles = getComputedStyle(element);
	const paddingTop = parseInt(styles.paddingTop.replace('px', ''), 10);
	const paddingRight = parseInt(styles.paddingRight.replace('px', ''), 10);
	const paddingBottom = parseInt(styles.paddingBottom.replace('px', ''), 10);
	const paddingLeft = parseInt(styles.paddingLeft.replace('px', ''), 10);
	const marginTop = parseInt(styles.marginTop.replace('px', ''), 10);
	const marginRight = parseInt(styles.marginRight.replace('px', ''), 10);
	const marginBottom = parseInt(styles.marginBottom.replace('px', ''), 10);
	const marginLeft = parseInt(styles.marginLeft.replace('px', ''), 10);
	const gap = parseInt(styles.gap.replace('px', ''), 10);
	const fontSize = parseInt(styles.fontSize.replace('px', ''), 10);

	return {
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		gap,
		fontSize,
	};
}

export { useRectTracker };

export type Rect = {
	left: number; //The left position of the element in pixels.
	top: number; //The top position of the element in pixels.
	bottom: number; //The bottom position of the element in pixels.
	width: number; //The width of the element in pixels.
	height: number; //The height of the element in pixels.

	/* The computed style of the element */
	computedStyle: {
		paddingTop: number;
		paddingRight: number;
		paddingBottom: number;
		paddingLeft: number;
		marginTop: number;
		marginRight: number;
		marginBottom: number;
		marginLeft: number;
		gap: number;
		fontSize: number;
	};

	topOffset: number; //The top offset of the element, which is the sum of the offsetTop values of all parent elements.
	leftOffset: number; // The left offset of the element, which is the sum of the offsetLeft values of all parent elements.
	windowWidth: number; //The width of the browser window.
	windowHeight: number; //The height of the browser window.
	maxScrollXDistance: number; //The maximum horizontal scroll distance of the element's scroll container.
	maxScrollYDistance: number; //The maximum vertical scroll distance of the element's scroll container.
	isSafari: boolean; //A boolean indicating whether the user is using Safari browser.
};
