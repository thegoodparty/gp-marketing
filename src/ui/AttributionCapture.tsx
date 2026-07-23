'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
	captureAttributionFromSearch,
	decorateAppLinkOnClick,
	decorateAppLinksInDocument,
	readGpAttributionCookie,
} from '~/lib/attribution';

export function AttributionCapture() {
	const pathname = usePathname();

	useEffect(() => {
		const attribution =
			captureAttributionFromSearch(window.location.search, window.location.hostname) ??
			readGpAttributionCookie();
		decorateAppLinksInDocument(attribution);
	}, [pathname]);

	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			const attribution = readGpAttributionCookie();
			decorateAppLinkOnClick(event, attribution);
		};

		document.addEventListener('click', handleClick, true);
		return () => {
			document.removeEventListener('click', handleClick, true);
		};
	}, []);

	return null;
}
