'use client';
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (window.matchMedia) {
			const media = window?.matchMedia(query);

			if (media.matches !== matches) {
				setMatches(media.matches);
			}

			function listener() {
				setMatches(media.matches);
			}

			media.addEventListener('change', listener);

			return () => media.removeEventListener('change', listener);
		}
		return;
	}, [matches, query]);

	return matches;
}
