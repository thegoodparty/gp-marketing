'use client';

import { useEffect, useRef } from 'react';

import { trackVoterGuideProfileViewed } from '~/lib/analytics';

type Props = Parameters<typeof trackVoterGuideProfileViewed>[0];

/**
 * Reports a /people profile view with the page's resolved state, which is the
 * one thing about these pages GA4 cannot read off the URL. Rendered by the
 * route next to the template, with only strings and booleans as props, so it
 * works from the server-rendered page without a handler crossing over.
 *
 * Fires once per person per mount: Strict Mode runs the effect twice in dev,
 * and a double count would read as two visitors.
 */
export function PersonProfileViewTracker(props: Props) {
	const trackedPersonId = useRef<string | null>(null);

	useEffect(() => {
		if (trackedPersonId.current === props.personId) return;
		trackedPersonId.current = props.personId;
		return trackVoterGuideProfileViewed(props);
		// The identity of `props` changes every render; the person is the view.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.personId]);

	return null;
}
