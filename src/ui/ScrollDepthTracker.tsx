'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const THRESHOLDS = [25, 50, 75, 100] as const;

export function ScrollDepthTracker() {
	const pathname = usePathname();
	const firedRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		firedRef.current = new Set();
	}, [pathname]);

	useEffect(() => {
		const handleScroll = () => {
			const amp = typeof window !== 'undefined' ? window.amplitude : undefined;
			if (!amp?.track) return;

			const { scrollTop, scrollHeight } = document.documentElement;
			const { clientHeight } = document.documentElement;
			const scrollable = scrollHeight - clientHeight;
			if (scrollable <= 0) return;

			const pct = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);

			for (const threshold of THRESHOLDS) {
				if (pct >= threshold && !firedRef.current.has(threshold)) {
					firedRef.current.add(threshold);
					amp.track('Scroll Depth', {
						scroll_depth_pct: threshold,
						page: pathname || '/',
					});
				}
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [pathname]);

	return null;
}
