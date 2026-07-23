'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
	type AttributionData,
	captureAttributionFromSearch,
	decorateAppUrl,
	readGpAttributionCookie,
} from '~/lib/attribution';

const AttributionContext = createContext<AttributionData | null>(null);

export function useAttribution(): AttributionData | null {
	return useContext(AttributionContext);
}

export function useDecoratedAppHref(href: string | undefined): string | undefined {
	const attribution = useAttribution();
	if (!href || !attribution) return href;
	return decorateAppUrl(href, attribution);
}

type Props = {
	children: ReactNode;
};

export function AttributionProvider({ children }: Props) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchKey = searchParams.toString();
	const [attribution, setAttribution] = useState<AttributionData | null>(null);

	useEffect(() => {
		const captured =
			captureAttributionFromSearch(searchKey ? `?${searchKey}` : '', window.location.hostname) ??
			readGpAttributionCookie();
		setAttribution(captured);
	}, [pathname, searchKey]);

	return <AttributionContext.Provider value={attribution}>{children}</AttributionContext.Provider>;
}
