'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const DEFAULT_OPTIONS = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px',
} as const;

export type UseFadeInOptions = {
	delay?: number;
	duration?: number;
	threshold?: number;
	rootMargin?: string;
};

export function useFadeIn(options: UseFadeInOptions = {}) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, {
		...DEFAULT_OPTIONS,
		threshold: options.threshold ?? DEFAULT_OPTIONS.threshold,
		rootMargin: options.rootMargin ?? DEFAULT_OPTIONS.rootMargin,
	});

	return {
		ref,
		inView,
		initial: { opacity: 0, y: 30 },
		animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
		transition: {
			duration: options.duration ?? 0.8,
			delay: options.delay ?? 0,
			ease: [0.16, 1, 0.3, 1] as const,
		},
	};
}
