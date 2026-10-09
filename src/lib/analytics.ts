/** Canonical app sign-up URL (matches `buttonTransformer` SignUp action). */
export const APP_SIGN_UP_HREF = 'https://app.goodparty.org/sign-up';

/** Canonical app login URL (matches `buttonTransformer` LogIn action). */
export const APP_LOG_IN_HREF = 'https://app.goodparty.org/login';

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

/**
 * The GA4 sink. Nothing here talks to GA4 directly: the GTM container
 * (`~/ui/GTM`) owns the GA4 tag, and the only way code reaches it is a push
 * to `window.dataLayer` that a Custom Event trigger in the container picks up
 * by its `event` name. Every event name and property key this site pushes is
 * listed in `docs/analytics.md`, which is the sheet whoever configures the
 * container works from.
 *
 * GTM's data layer model merges pushes, so a key set by one event is still
 * readable when the next event fires. Each event therefore carries its whole
 * property set every time, and a tag only reads the keys its own event sets.
 */
export function trackDataLayerEvent(event: string, properties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event, ...properties });
}

/**
 * The voter guide events, keyed by what the visitor did. `dataLayer` is the
 * GA4 name GTM triggers on (snake_case, GA4's convention); `amplitude` is the
 * title-case twin in the style of the existing search events. `null` for the
 * data layer means the event is Amplitude-only, because GA4 already measures
 * that behaviour on its own.
 *
 * `keys` is every property the event can carry, and every push writes all of
 * them. Two callers of one event know different things (the offices list's
 * Show more has a page level, the index's has a hidden count), and GTM keeps
 * the last value of a key a push leaves out, so a tag would otherwise read one
 * caller's value on the other caller's event.
 */
export const VOTER_GUIDE_EVENTS = {
	officeClick: {
		dataLayer: 'voter_guide_office_click',
		amplitude: 'Voter Guide - Office Clicked',
		keys: ['list', 'office_name', 'office_level', 'office_type', 'election_date', 'pledged_count', 'href'],
	},
	officesFilterChange: {
		dataLayer: 'voter_guide_offices_filter_change',
		amplitude: 'Voter Guide - Offices Filter Changed',
		keys: ['filter', 'value', 'page_level'],
	},
	heroButtonClick: {
		dataLayer: 'voter_guide_hero_button_click',
		amplitude: 'Voter Guide - Hero Button Clicked',
		keys: ['label', 'href', 'location_level', 'state'],
	},
	featuredCandidateClick: {
		dataLayer: 'voter_guide_featured_candidate_click',
		amplitude: 'Voter Guide - Featured Candidate Clicked',
		keys: ['name', 'office', 'location', 'is_pledged', 'position', 'href'],
	},
	carouselPage: {
		dataLayer: 'voter_guide_carousel_page',
		amplitude: 'Voter Guide - Carousel Paged',
		keys: ['carousel', 'index', 'direction'],
	},
	positionPersonClick: {
		dataLayer: 'voter_guide_position_person_click',
		amplitude: 'Voter Guide - Position Person Clicked',
		keys: ['list', 'name', 'href', 'party', 'is_pledged', 'is_winner', 'seat', 'decided'],
	},
	showMoreClick: {
		dataLayer: 'voter_guide_show_more_click',
		amplitude: 'Voter Guide - Show More Clicked',
		keys: ['list', 'hidden_count', 'page_level'],
	},
	profileView: {
		dataLayer: 'voter_guide_profile_view',
		amplitude: 'Voter Guide - Profile Viewed',
		keys: ['person_id', 'profile_state', 'persona', 'claimed', 'pledged', 'removed', 'unpublished', 'party_class'],
	},
	pledgeModalOpen: {
		dataLayer: 'voter_guide_pledge_modal_open',
		amplitude: 'Voter Guide - Pledge Modal Opened',
		keys: ['source'],
	},
	claimProfileClick: {
		dataLayer: 'voter_guide_claim_profile_click',
		amplitude: 'Voter Guide - Claim Profile Clicked',
		keys: ['source', 'label', 'href', 'layout'],
	},
	locationIndexClick: {
		dataLayer: 'voter_guide_location_index_click',
		amplitude: 'Voter Guide - Location Index Clicked',
		keys: ['place_name', 'place_level', 'href', 'searched'],
	},
	featuredCityClick: {
		dataLayer: 'voter_guide_featured_city_click',
		amplitude: 'Voter Guide - Featured City Clicked',
		keys: ['city_name', 'state', 'open_elections_count', 'href'],
	},
	outboundClick: {
		dataLayer: null,
		amplitude: 'Voter Guide - Outbound Link Clicked',
		keys: ['href', 'host', 'link_text'],
	},
} as const satisfies Record<string, { dataLayer: string | null; amplitude: string; keys: readonly string[] }>;

export type VoterGuideEventKey = keyof typeof VOTER_GUIDE_EVENTS;

/** Property values a server component can hand a client component, which rules out functions and dates. */
export type VoterGuideEventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * A click a server-rendered block wants reported. It is data, not a handler,
 * so a server component (the location hero, the claim block) can pass it to the
 * shared button without crossing the server-to-client boundary with a function,
 * which renders in SSR tests and throws on Vercel.
 */
export type VoterGuideClickTracking = {
	event: VoterGuideEventKey;
	properties?: VoterGuideEventProperties;
};

/** The events marketing also wants on the CRM side, so Segment forwards them to HubSpot. */
const SEGMENT_FORWARDED: ReadonlySet<VoterGuideEventKey> = new Set<VoterGuideEventKey>(['claimProfileClick']);

/**
 * Sends one voter guide event to every destination it belongs to: the GA4 data
 * layer first (GA4 is the one marketing reports on), then Amplitude, then
 * Segment for the few events in {@link SEGMENT_FORWARDED}. `page_path` is added
 * here so every event can be cut by the page it came from, and every key the
 * event declares is written, null when the caller had nothing for it, so a tag
 * reading the key sees "unknown" rather than an earlier push's value.
 */
export function trackVoterGuideEvent(key: VoterGuideEventKey, properties: VoterGuideEventProperties = {}): void {
	if (typeof window === 'undefined') return;
	const names = VOTER_GUIDE_EVENTS[key];
	const payload: Record<string, unknown> = { page_path: window.location.pathname };
	for (const name of names.keys) {
		payload[name] = properties[name] ?? null;
	}
	for (const [name, value] of Object.entries(properties)) {
		if (!(name in payload)) payload[name] = value ?? null;
	}

	if (names.dataLayer) trackDataLayerEvent(names.dataLayer, payload);
	trackEvent(names.amplitude, payload);
	if (SEGMENT_FORWARDED.has(key)) trackSegmentEvent(names.amplitude, payload);
}

const noop = () => undefined;

/**
 * Runs `fn` once Amplitude can take an event. `trackEvent` is a bare
 * `window.amplitude?.track` with no queue, and the SDK script loads after the
 * page is interactive, so a view event fired straight from a mount effect is
 * dropped for most visitors (see `~/experiments/ExperimentExposureTracker`).
 * `~/ui/Amplitude` dispatches `experiment:ready` once the SDK is initialised or
 * known to be unavailable, so a caller waits for that when the global is not
 * there yet. The data layer needs no such wait: GTM replays the queue.
 */
export function whenAmplitudeReady(fn: () => void): () => void {
	if (typeof window === 'undefined') return noop;
	if (window.amplitude) {
		fn();
		return noop;
	}
	window.addEventListener('experiment:ready', fn, { once: true });
	return () => window.removeEventListener('experiment:ready', fn);
}

/**
 * A /people profile page view with the facts GA4 cannot read off the URL:
 * which Figma state the page rendered in and why. The data layer gets it at
 * once; Amplitude waits for its SDK (see {@link whenAmplitudeReady}), and the
 * Amplitude copy is sent straight to `trackEvent` so the data layer is never
 * pushed twice.
 */
export function trackVoterGuideProfileViewed(props: {
	personId: string;
	profileState: string;
	persona: string;
	claimed: boolean;
	pledged: boolean;
	removed: boolean;
	unpublished: boolean;
	partyClass: string | null;
}): () => void {
	if (typeof window === 'undefined') return noop;
	const payload = {
		page_path: window.location.pathname,
		person_id: props.personId,
		profile_state: props.profileState,
		persona: props.persona,
		claimed: props.claimed,
		pledged: props.pledged,
		removed: props.removed,
		unpublished: props.unpublished,
		party_class: props.partyClass ?? null,
	};
	trackDataLayerEvent(VOTER_GUIDE_EVENTS.profileView.dataLayer, payload);
	return whenAmplitudeReady(() => trackEvent(VOTER_GUIDE_EVENTS.profileView.amplitude, payload));
}
