'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { trackVoterGuideEvent } from '~/lib/analytics';
import { isLogRocketPath } from '~/lib/logrocketPaths';
import { isExternalToEcosystem } from '~/ui/_lib/linkBehavior';

/**
 * Amplitude's copy of the clicks that leave the site from a voter guide page:
 * a candidate's campaign site or social profile, a county clerk's page. GA4
 * already counts these on its own (its built-in outbound `click` event), so
 * this one goes to Amplitude only; see `trackVoterGuideEvent`.
 *
 * One capture-phase listener on the document rather than a handler per link:
 * the profile's links are assembled in several blocks, and the point is to
 * miss none of them. The page set is the one LogRocket records, which is the
 * voter guide by another name.
 */
export function OutboundLinkTracker() {
	const pathname = usePathname();

	useEffect(() => {
		if (!isLogRocketPath(pathname)) return;

		const onClick = (event: MouseEvent) => {
			if (!(event.target instanceof Element)) return;
			const anchor = event.target.closest('a[href]');
			if (!(anchor instanceof HTMLAnchorElement)) return;
			const href = anchor.getAttribute('href')?.trim();
			if (!href || !/^https?:/i.test(href) || !isExternalToEcosystem(href)) return;

			let host: string | null = null;
			try {
				host = new URL(href).hostname;
			} catch {
				host = null;
			}
			trackVoterGuideEvent('outboundClick', {
				href,
				host,
				link_text: anchor.textContent?.trim().slice(0, 100) || null,
			});
		};

		document.addEventListener('click', onClick, true);
		return () => document.removeEventListener('click', onClick, true);
	}, [pathname]);

	return null;
}
