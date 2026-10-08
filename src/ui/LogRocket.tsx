'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isGoodPartyProductionHost } from '~/lib/crawlableHosts';
import { isLogRocketPath } from '~/lib/logrocketPaths';

const LOGROCKET_APP_ID = 'cicjzw/goodpartyorg';

let initialized = false;

/**
 * Session recording for the programmatic election and people pages only. The SDK
 * is imported on demand so it never ships in the bundle for the rest of the site,
 * and init runs once per page load: a session that starts on a recorded page keeps
 * recording through client-side navigation, but a visit that lands anywhere else
 * never starts one.
 *
 * Gated on the production host, not `VERCEL_ENV`, for the reason in
 * `~/lib/crawlableHosts`: preview deploys report `production` while being served
 * on a `*.vercel.app` hostname, and recording those (or local dev) would spend the
 * plan's session quota on nobody.
 */
export function LogRocket() {
	const pathname = usePathname();

	useEffect(() => {
		if (initialized || !isLogRocketPath(pathname)) return;
		if (!isGoodPartyProductionHost(window.location.hostname)) return;
		initialized = true;
		void import('logrocket').then(mod => {
			const sdk = (mod as unknown as { default?: typeof mod }).default ?? mod;
			sdk.init(LOGROCKET_APP_ID, { rootHostname: 'goodparty.org' });
		});
	}, [pathname]);

	return null;
}
