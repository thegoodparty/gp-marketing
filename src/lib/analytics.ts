/** Canonical app sign-up URL (matches `buttonTransformer` SignUp action). */
export const APP_SIGN_UP_HREF = 'https://app.goodparty.org/sign-up';

export function trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.amplitude?.track(eventName, eventProperties);
}

/**
 * The Segment sink, which is a different destination set from {@link trackEvent}'s
 * Amplitude — Segment is what marketing builds automation on, because its HubSpot
 * destination lands events on the CRM side without anyone shipping code.
 *
 * The snippet in `~/ui/Segment` is the stub queue, so `analytics.track` exists and
 * buffers from the moment the inline script runs; a call made before analytics.js
 * finishes downloading is replayed, not dropped.
 */
export function trackSegmentEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.analytics?.track(eventName, eventProperties);
}

/** Click-to-call MOFU CTA (component_clickToCallBlock). */
export function trackClickToCallCtaViewed(props: { page_path: string | null }): void {
	trackEvent('Click to Call CTA Viewed', { page_path: props.page_path });
}

export function trackClickToCallCtaClicked(props: { page_path: string | null }): void {
	trackEvent('Click to Call CTA Clicked', { page_path: props.page_path });
}

export function trackClickToCallPhoneSubmitted(props: { page_path: string | null }): void {
	trackEvent('Click to Call Phone Submitted', { page_path: props.page_path });
}

/**
 * A completed notify submission on an unclaimed /people profile: a visitor has
 * asked us to nudge `personId` to finish their profile, and gp-api has accepted
 * the lead. Call it on success, never on click — the point of the number is
 * completed asks.
 *
 * It goes to Segment as well as Amplitude because the CRM-side count marketing
 * would otherwise automate on, the HubSpot contact property
 * `candidate_profile_requests`, is only a lower bound. gp-api writes it solely
 * when the SUBJECT resolves to exactly one HubSpot contact in the civics person
 * mart (`mart_civics.people.hs_contact_id`, which the mart nulls for a person
 * whose identity cluster carries zero or several contacts), and it deliberately
 * mints nothing for a person the CRM has never seen — see
 * `CrmPersonProfilesService.syncClaimRequestCount` in gp-api. Notify exists for
 * the people we hold the least data on, so the population that write skips is
 * the population the number is meant to describe, and it skips them without an
 * error anywhere: the call is detached from the request and swallows its own
 * failures. Segment sees every completed submission whatever the CRM knows.
 *
 * `page_path` is passed explicitly, as in {@link trackSignUpClicked}. Nothing in
 * this module attaches it, and Segment's snippet puts the path in event
 * *context* rather than in properties, so a property-keyed audience would not
 * find it otherwise.
 *
 * `personId` is the join key to the subject's HubSpot record: it is the same
 * value as `mart_civics.people.gp_person_id`, whose `hs_contact_id` column is
 * the contact gp-api writes `candidate_profile_requests` to. The contact id is
 * deliberately NOT resolved here — that lookup is a warehouse query gp-api runs
 * off the request path, and it yields null for most of the spine, so putting it
 * on the event would both slow a public form submit and read as "no contact"
 * far more often than it read as a real id.
 *
 * `claimRequestId` is gp-api's stored-lead id, echoed back through the proxy so
 * a Segment event can be tied to the exact row that produced it. Null when the
 * lead was accepted but the id could not be read back; the event still fires,
 * because a completed ask is the thing being counted.
 */
export function trackPersonProfileNotifySubmitted(props: {
	personId: string;
	claimRequestId?: string | null;
}): void {
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
	const properties = {
		personId: props.personId,
		claimRequestId: props.claimRequestId ?? null,
		page_path: pagePath ?? null,
	};

	trackEvent('Person Profile Notify Submitted', properties);
	trackSegmentEvent('Person Profile Notify Submitted', properties);
}

/**
 * True when the path ends with `/sign-up` (any origin, any prefix).
 * Intentionally broad so every sign-up surface is tracked, including future
 * paths like `/partner/sign-up`. Tighten if only specific origins should match.
 */
export function isSignUpUrl(href: string | undefined | null): boolean {
	if (!href?.trim()) return false;
	const withoutQuery = href.trim().split('?')[0] ?? '';
	const path = withoutQuery.replace(/\/+$/, '').toLowerCase();
	return path.endsWith('/sign-up');
}

/**
 * Fires `'Sign Up Clicked'` for any sign-up link click.
 *
 * When `formId` is provided this also pushes a sign-up-only payload into `window.dataLayer`
 * so GTM Data Layer Variables keyed to `formId` can resolve the originating CTA.
 */
export function trackSignUpClicked(props: { href: string; label?: string | null; formId?: string | null }): void {
	const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;

	trackEvent('Sign Up Clicked', {
		href: props.href,
		label: props.label ?? null,
		page_path: pagePath ?? null,
	});

	if (typeof window === 'undefined') return;

	const formId = props.formId?.trim();
	if (!formId) return;

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'sign_up_click',
		formId,
	});
}
