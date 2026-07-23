'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
	createContext,
	Suspense,
	useContext,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from 'react';
import {
	type AttributionData,
	captureAttributionFromSearch,
	decorateAppUrl,
	readGpAttributionCookie,
} from '~/lib/attribution';
import useIsomorphicLayoutEffect from '~/ui/_lib/useIsomorphicLayoutEffect';

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
	const [attribution, setAttribution] = useState<AttributionData | null>(null);

	return (
		<AttributionContext.Provider value={attribution}>
			<Suspense fallback={null}>
				<AttributionCapture onCapture={setAttribution} />
			</Suspense>
			{children}
		</AttributionContext.Provider>
	);
}

type CaptureProps = {
	onCapture: Dispatch<SetStateAction<AttributionData | null>>;
};

function AttributionCapture({ onCapture }: CaptureProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchKey = searchParams.toString();

	useIsomorphicLayoutEffect(() => {
		const captured =
			captureAttributionFromSearch(searchKey ? `?${searchKey}` : '', window.location.hostname) ??
			readGpAttributionCookie();
		onCapture(captured);
	}, [pathname, searchKey, onCapture]);

	return null;
}
